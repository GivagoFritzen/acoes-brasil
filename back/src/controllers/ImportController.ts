import multer from "multer";
import { Request, Response } from "express";
import { extractField, parseDecimal, readSpreadsheetRows, toBrDateString } from "../utils/spreadsheet";
import { CreateOrderDto } from "../application/dto/CreateOrderDto";
import { ImportOrdersUseCase } from "../application/use-cases/ImportOrdersUseCase";
import { OrderOperacao, OrderTipo } from "../domain/entities/OrderEntity";
import { SequelizeOrderRepository } from "../infrastructure/repositories/SequelizeOrderRepository";
import { SequelizePortfolioRepository } from "../infrastructure/repositories/SequelizePortfolioRepository";
import { SequelizeOrderSellSnapshotRepository } from "../infrastructure/repositories/SequelizeOrderSellSnapshotRepository";
import { FundamentusQuoteProvider } from "../infrastructure/services/FundamentusQuoteProvider";
import { SequelizeTransactionManager } from "../infrastructure/database/SequelizeTransactionManager";
import { normalizeOrderCodigo } from "../../../common/utils/order-codigo.utils";

const upload = multer({ storage: multer.memoryStorage() });

const orderRepository = new SequelizeOrderRepository();
const portfolioRepository = new SequelizePortfolioRepository();
const sellSnapshotRepository = new SequelizeOrderSellSnapshotRepository();
const quoteProvider = new FundamentusQuoteProvider();
const transactionManager = new SequelizeTransactionManager();

const importOrdersUseCase = new ImportOrdersUseCase(
  orderRepository,
  portfolioRepository,
  sellSnapshotRepository,
  quoteProvider,
  transactionManager
);

export class ImportController {
  public getMiddleware() {
    return upload.single("file");
  }

  public async importAsync(req: Request, res: Response) {
    const file = (req as any).file as { buffer?: Buffer } | undefined;

    if (!file?.buffer) {
      return res.status(400).json({ message: "Arquivo não enviado. Use o campo 'file'." });
    }

    try {
      const rows = readSpreadsheetRows(file.buffer);

      if (!rows.length) {
        return res.status(400).json({ message: "Planilha sem dados." });
      }

      const ordersToImport: CreateOrderDto[] = [];

      for (const [index, row] of rows.entries()) {
        const line = index + 2;
        const codigo = normalizeOrderCodigo(String(
          extractField(row, ["Código de Negociação", "Codigo de Negociacao", "Código", "Codigo"]) ?? ""
        ));

        const quantidadeRaw = parseDecimal(extractField(row, ["Quantidade"]));
        const preco = parseDecimal(extractField(row, ["Preço", "Preco"]));
        const data = toBrDateString(extractField(row, ["Data do Negócio", "Data do Negocio", "Data"]));

        const normalizeOperacao = (value: unknown): OrderOperacao | null => {
          const raw = String(value ?? "").trim().toLowerCase();
          if (raw.includes("compra")) return "Compra";
          if (raw.includes("venda")) return "Venda";
          return null;
        };
        const operacao = normalizeOperacao(extractField(row, ["Tipo de Movimentação", "Tipo de Movimentacao"]));

        const normalizeTipo = (value: unknown): OrderTipo => {
          const raw = String(value ?? "").trim().toLowerCase();
          if (raw.includes("fii") || raw.includes("fundo imobili")) return "FII";
          if (raw.includes("bdr")) return "BDR";
          return "ACAO";
        };
        const tipo = normalizeTipo(extractField(row, ["Mercado"]));
        const quantidade = quantidadeRaw === null ? null : Math.trunc(quantidadeRaw);

        if (!codigo || !quantidade || !preco || !data || !operacao) {
          throw new Error(`Linha ${line}: dados obrigatórios inválidos para importação de negociação.`);
        }

        ordersToImport.push({
          codigo,
          quantidade,
          valor: preco,
          data,
          tipo,
          operacao,
        });
      }

      const importedCount = await importOrdersUseCase.executeAsync(ordersToImport);
      return res.status(201).json({ imported: importedCount });
    } catch (error: any) {
      return res.status(400).json({
        message: "Erro ao importar planilha de negociação",
        error: error.message || error,
      });
    }
  }
}
