import { Request, Response } from "express";
import { CreateOrUpdatePortfolioUseCase } from "../application/use-cases/CreateOrUpdatePortfolioUseCase";
import { DeletePortfolioUseCase } from "../application/use-cases/DeletePortfolioUseCase";
import { ListPortfolioUseCase } from "../application/use-cases/ListPortfolioUseCase";
import { Container } from "../shared/dependency-injection/Container";
import { ErrorHandler } from "../shared/error-handler/ErrorHandler";

export class PortfolioController {
  private createOrUpdatePortfolioUseCase: CreateOrUpdatePortfolioUseCase;
  private deletePortfolioUseCase: DeletePortfolioUseCase;
  private listPortfolioUseCase: ListPortfolioUseCase;

  constructor() {
    this.createOrUpdatePortfolioUseCase = Container.get("createOrUpdatePortfolioUseCase");
    this.deletePortfolioUseCase = Container.get("deletePortfolioUseCase");
    this.listPortfolioUseCase = Container.get("listPortfolioUseCase");
  }

  async createOrUpdateAsync(req: Request, res: Response): Promise<Response> {
    try {
      const result = await this.createOrUpdatePortfolioUseCase.executeAsync({
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
      await this.deletePortfolioUseCase.executeAsync(String(req.params.id));
      return res.json({ message: "Ativo do portfólio deletado com sucesso." });
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }

  async listAsync(req: Request, res: Response): Promise<Response> {
    try {
      const portfolios = await this.listPortfolioUseCase.executeAsync();
      return res.json(portfolios);
    } catch (error) {
      return ErrorHandler.handle(error, req, res);
    }
  }
}
