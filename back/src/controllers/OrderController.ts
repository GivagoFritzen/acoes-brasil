import { Request, Response } from "express";
import * as XLSX from "xlsx";
import { CreateOrderDto } from "../application/dto/CreateOrderDto";
import { CreateOrderUseCase } from "../application/use-cases/CreateOrderUseCase";
import { DeleteOrderUseCase } from "../application/use-cases/DeleteOrderUseCase";
import { ListOrdersUseCase } from "../application/use-cases/ListOrdersUseCase";
import { IOrderFilters } from "../domain/interfaces/IOrderFilters";
import { Container } from "../shared/dependency-injection/Container";
import { OrderValidator } from "../shared/validators/OrderValidator";
import { ErrorHandler } from "../shared/error-handler/ErrorHandler";
import { DateUtils } from "../shared/utils/DateUtils";
import { SequelizeOrderSellSnapshotRepository } from "../infrastructure/repositories/SequelizeOrderSellSnapshotRepository";
import { normalizeOrderCodigo } from "../../../common/utils/order-codigo.utils";

export class OrderController {
  private createOrderUseCase: CreateOrderUseCase;
  private deleteOrderUseCase: DeleteOrderUseCase;
  private listOrdersUseCase: ListOrdersUseCase;
  private sellSnapshotRepository: SequelizeOrderSellSnapshotRepository;

  constructor() {
    this.createOrderUseCase = Container.get('createOrderUseCase');
    this.deleteOrderUseCase = Container.get('deleteOrderUseCase');
    this.listOrdersUseCase = Container.get('listOrdersUseCase');
    this.sellSnapshotRepository = Container.get('sellSnapshotRepository');
  }

  async createAsync(req: Request, res: Response): Promise<Response> {
    try {
      const codigo = normalizeOrderCodigo(String(req.body?.codigo ?? ""));
      const operacao = OrderValidator.parseOperacao(String(req.body?.operacao ?? ""));
      const tipo = OrderValidator.parseTipo(String(req.body?.tipo ?? ""), codigo);
      const data = OrderValidator.normalizeToBrDateString(req.body?.data);

      const dto: CreateOrderDto = {
        codigo,
        quantidade: Number(req.body?.quantidade ?? 0),
        valor: Number(req.body?.valor ?? 0),
        data,
        tipo,
        operacao,
        nome: req.body?.nome ? String(req.body.nome) : undefined,
      };

      OrderValidator.validateCreateOrderDto(dto);
      OrderValidator.validateOrderDate(dto.data);

      const order = await this.createOrderUseCase.executeAsync(dto);
      return res.status(201).json(order);
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }

  async deleteAsync(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await this.deleteOrderUseCase.executeAsync(String(id));
      return res.json({ message: "Ordem deletada com sucesso." });
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }

  async listAsync(req: Request, res: Response): Promise<Response> {
    try {
      const { data, dataInicial, dataFinal, codigo, operacao, page, limit } = req.query;

      const filters: IOrderFilters = {
        data: typeof data === "string" ? data : undefined,
        dataInicial: typeof dataInicial === "string" ? dataInicial : undefined,
        dataFinal: typeof dataFinal === "string" ? dataFinal : undefined,
        codigo: typeof codigo === "string" ? normalizeOrderCodigo(codigo) : undefined,
        operacao: typeof operacao === "string" ? operacao : undefined,
      };

      const result = await this.listOrdersUseCase.executeAsync(filters, Number(page) || 1, Number(limit) || 20);
      return res.json(result);
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }

  async getSellSnapshotsDataAsync(req: Request, res: Response): Promise<Response> {
    try {
      const snapshots = await this.sellSnapshotRepository.findAllAsync();
      const rows = snapshots.map((snapshot) => ({
        codigo: snapshot.codigo,
        precoMedioAtual: snapshot.precoMedioAtual,
        quantidade: snapshot.quantidade,
        valorAtualAcao: snapshot.valorAtualAcao,
        ganhos: snapshot.ganhos,
        data: snapshot.data,
      }));
      return res.json(rows);
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }

  async exportSellSnapshotsAsync(req: Request, res: Response): Promise<Response> {
    try {
      const snapshots = await this.sellSnapshotRepository.findAllAsync();

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
      const fileName = DateUtils.generateFileName("vendas");

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

      return res.send(fileBuffer);
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }
}
