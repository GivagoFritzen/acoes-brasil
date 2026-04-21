import { Request, Response } from "express";
import * as XLSX from "xlsx";
import { CreateOrderDto } from "../application/dto/CreateOrderDto";
import { CreateOrderUseCase } from "../application/use-cases/CreateOrderUseCase";
import { DeleteOrderUseCase } from "../application/use-cases/DeleteOrderUseCase";
import { ListOrdersUseCase } from "../application/use-cases/ListOrdersUseCase";
import { OrderOperacao, OrderTipo } from "../domain/entities/OrderEntity";
import { IOrderFilters } from "../domain/interfaces/IOrderFilters";
import { SequelizeTransactionManager } from "../infrastructure/database/SequelizeTransactionManager";
import { SequelizeOrderRepository } from "../infrastructure/repositories/SequelizeOrderRepository";
import { SequelizeOrderSellSnapshotRepository } from "../infrastructure/repositories/SequelizeOrderSellSnapshotRepository";
import { SequelizePortfolioRepository } from "../infrastructure/repositories/SequelizePortfolioRepository";
import { FundamentusQuoteProvider } from "../infrastructure/services/FundamentusQuoteProvider";

const orderRepository = new SequelizeOrderRepository();
const portfolioRepository = new SequelizePortfolioRepository();
const sellSnapshotRepository = new SequelizeOrderSellSnapshotRepository();
const quoteProvider = new FundamentusQuoteProvider();
const transactionManager = new SequelizeTransactionManager();

const createOrderUseCase = new CreateOrderUseCase(
  orderRepository,
  portfolioRepository,
  sellSnapshotRepository,
  quoteProvider,
  transactionManager
);
const deleteOrderUseCase = new DeleteOrderUseCase(
  orderRepository,
  portfolioRepository,
  transactionManager
);
const listOrdersUseCase = new ListOrdersUseCase(orderRepository);

export class OrderController {
  async createAsync(req: Request, res: Response) {
    try {
      const operacaoValue = String(req.body?.operacao ?? "").trim().toLowerCase();
      let operacao: OrderOperacao | undefined;
      if (operacaoValue.includes("compra")) operacao = "Compra";
      else if (operacaoValue.includes("venda")) operacao = "Venda";

      const tipoValue = String(req.body?.tipo ?? "").trim().toLowerCase();
      let tipo: OrderTipo = "ACAO";
      if (tipoValue.includes("fii") || tipoValue.includes("fundo imobili")) tipo = "FII";
      else if (tipoValue.includes("bdr")) tipo = "BDR";

      const normalizeToBrDateString = (val: unknown): string => {
        if (!val) return "";
        const str = String(val).trim();
        const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (isoMatch) return `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}`;
        const isoFullMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})T/);
        if (isoFullMatch) return `${isoFullMatch[3]}-${isoFullMatch[2]}-${isoFullMatch[1]}`;
        return str;
      };

      const dto: CreateOrderDto = {
        codigo: String(req.body?.codigo ?? ""),
        quantidade: Number(req.body?.quantidade ?? 0),
        valor: Number(req.body?.valor ?? 0),
        data: normalizeToBrDateString(req.body?.data),
        tipo,
        operacao: operacao as OrderOperacao,
        nome: req.body?.nome ? String(req.body.nome) : undefined,
      };

      const order = await createOrderUseCase.executeAsync(dto);
      return res.status(201).json(order);
    } catch (error: any) {
      if (error.message && error.message.includes("inválidos para criar order")) {
        return res.status(400).json({ message: error.message });
      }
      if (error.message && error.message.includes("futura")) {
        return res.status(400).json({ message: error.message });
      }
      if (error.message && error.message.includes("Operação inválida")) {
        return res.status(400).json({ message: error.message });
      }

      return res.status(400).json({
        message: "Erro ao criar order",
        error: error.message || error,
      });
    }
  }

  async deleteAsync(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await deleteOrderUseCase.executeAsync(String(id));
      return res.json({ message: "Ordem deletada com sucesso." });
    } catch (error: any) {
      if (error.message === "Ordem não encontrada.") {
        return res.status(404).json({ message: error.message });
      }
      return res.status(400).json({
        message: "Erro ao deletar ordem",
        error: error.message || error,
      });
    }
  }

  async listAsync(req: Request, res: Response) {
    try {
      const { data, dataInicial, dataFinal, codigo, operacao, page, limit } = req.query;

      const filters: IOrderFilters = {
        data: typeof data === "string" ? data : undefined,
        dataInicial: typeof dataInicial === "string" ? dataInicial : undefined,
        dataFinal: typeof dataFinal === "string" ? dataFinal : undefined,
        codigo: typeof codigo === "string" ? codigo : undefined,
        operacao: typeof operacao === "string" ? operacao : undefined,
      };

      const result = await listOrdersUseCase.executeAsync(filters, Number(page) || 1, Number(limit) || 20);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: "Erro ao listar ordens",
        error: error.message || error,
      });
    }
  }

  async getSellSnapshotsDataAsync(req: Request, res: Response) {
    try {
      const snapshots = await sellSnapshotRepository.findAllAsync();
      const rows = snapshots.map((snapshot) => ({
        codigo: snapshot.codigo,
        precoMedioAtual: snapshot.precoMedioAtual,
        quantidade: snapshot.quantidade,
        valorAtualAcao: snapshot.valorAtualAcao,
        ganhos: snapshot.ganhos,
        data: snapshot.data,
      }));
      return res.json(rows);
    } catch (error: any) {
      return res.status(400).json({
        message: "Erro ao obtersnapshots",
        error: error.message || error,
      });
    }
  }

  async exportSellSnapshotsAsync(req: Request, res: Response) {
    try {
      const snapshots = await sellSnapshotRepository.findAllAsync();

      const rows = snapshots.map((snapshot) => {
        const custoMedioTotal = snapshot.precoMedioAtual * snapshot.quantidade;
        const valorVendaTotal = snapshot.valorAtualAcao * snapshot.quantidade;
        let ganhos = snapshot.ganhos;
        if (ganhos === 0) ganhos = valorVendaTotal - custoMedioTotal;

        return {
          Data: snapshot.data,
          Ativo: snapshot.codigo,
          "Preço Médio": snapshot.precoMedioAtual,
          "Quantidade Vendida": snapshot.quantidade,
          "Preço Venda": snapshot.valorAtualAcao,
          "Custo Médio Total": custoMedioTotal,
          "Valor Total Venda": valorVendaTotal,
          "Lucro/Perda": ganhos,
        };
      });

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas");

      const fileBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      const now = new Date();
      const fileName = `vendas-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
        now.getDate()
      ).padStart(2, "0")}.xlsx`;

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);

      return res.send(fileBuffer);
    } catch (error: any) {
      return res.status(400).json({
        message: "Erro ao exportar snapshots",
        error: error.message || error,
      });
    }
  }
}
