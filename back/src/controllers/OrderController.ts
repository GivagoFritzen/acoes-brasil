import { Request, Response } from "express";
import { CreateOrderDto } from "../application/dto/CreateOrderDto";
import { CreateOrderService } from "../application/services/CreateOrderService";
import { DeleteOrderService } from "../application/services/DeleteOrderService";
import { ListOrdersService } from "../application/services/ListOrdersService";
import { GetSellSnapshotsService } from "../application/services/GetSellSnapshotsService";
import { ExportSellSnapshotsService } from "../application/services/ExportSellSnapshotsService";
import { IOrderFilters } from "../domain/interfaces/IOrderFilters";
import { Container } from "../shared/dependency-injection/Container";
import { OrderValidator } from "../shared/validators/OrderValidator";
import { ErrorHandler } from "../shared/error-handler/ErrorHandler";
import { normalizeOrderCodigo } from "../../../common/utils/order-codigo.utils";

export class OrderController {
  private createOrderService: CreateOrderService;
  private deleteOrderService: DeleteOrderService;
  private listOrdersService: ListOrdersService;
  private getSellSnapshotsService: GetSellSnapshotsService;
  private exportSellSnapshotsService: ExportSellSnapshotsService;

  constructor() {
    this.createOrderService = Container.get('createOrderService');
    this.deleteOrderService = Container.get('deleteOrderService');
    this.listOrdersService = Container.get('listOrdersService');
    this.getSellSnapshotsService = Container.get('getSellSnapshotsService');
    this.exportSellSnapshotsService = Container.get('exportSellSnapshotsService');
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
      };

      OrderValidator.validateCreateOrderDto(dto);
      OrderValidator.validateOrderDate(dto.data);

      const order = await this.createOrderService.executeAsync(dto);
      return res.status(201).json(order);
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }

  async deleteAsync(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await this.deleteOrderService.executeAsync(String(id));
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

      const result = await this.listOrdersService.executeAsync(filters, Number(page) || 1, Number(limit) || 20);
      return res.json(result);
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }

  async getSellSnapshotsDataAsync(req: Request, res: Response): Promise<Response> {
    try {
      const rows = await this.getSellSnapshotsService.executeAsync();
      return res.json(rows);
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }

  async exportSellSnapshotsAsync(req: Request, res: Response): Promise<Response> {
    try {
      const { buffer, fileName } = await this.exportSellSnapshotsService.executeAsync();
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }
}
