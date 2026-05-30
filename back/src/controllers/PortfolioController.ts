import { Request, Response } from "express";
import { CreateOrUpdatePortfolioService } from "../application/services/CreateOrUpdatePortfolioService";
import { DeletePortfolioService } from "../application/services/DeletePortfolioService";
import { ListPortfolioService } from "../application/services/ListPortfolioService";
import { Container } from "../shared/dependency-injection/Container";
import { ErrorHandler } from "../shared/error-handler/ErrorHandler";
import { isValidUuid } from "../shared/validators/IdValidator";

export class PortfolioController {
  private createOrUpdatePortfolioService: CreateOrUpdatePortfolioService;
  private deletePortfolioService: DeletePortfolioService;
  private listPortfolioService: ListPortfolioService;

  constructor() {
    this.createOrUpdatePortfolioService = Container.get("CreateOrUpdatePortfolioService");
    this.deletePortfolioService = Container.get("DeletePortfolioService");
    this.listPortfolioService = Container.get("ListPortfolioService");
  }

  async createOrUpdateAsync(req: Request, res: Response): Promise<Response> {
    try {
      const result = await this.createOrUpdatePortfolioService.executeAsync({
        codigo: String(req.body?.codigo ?? ""),
        quantidade: Number(req.body?.quantidade),
        precoMedio: Number(req.body?.precoMedio),
      });
      return res.status(result.created ? 201 : 200).json(result.portfolio);
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }

  async deleteAsync(req: Request, res: Response): Promise<Response> {
    try {
      const id = String(req.params.id);
      if (!isValidUuid(id)) {
        return res.status(400).json({ message: "ID inválido." });
      }
      await this.deletePortfolioService.executeAsync(id);
      return res.json({ message: "Ativo do portfólio deletado com sucesso." });
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }

  async listAsync(req: Request, res: Response): Promise<Response> {
    try {
      const portfolios = await this.listPortfolioService.executeAsync();
      return res.json(portfolios);
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }
}
