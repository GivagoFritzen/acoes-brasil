import { CreateOrderDto } from "../dto/CreateOrderDto";
import { ImportOrderResult } from "../dto/ImportOrderResult";
import { ImportOrderDivergence } from "../dto/ImportOrderDivergence";
import { ImportOrderValidationResult } from "../dto/ImportOrderValidationResult";
import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { IOrderSellSnapshotRepository } from "../../domain/interfaces/IOrderSellSnapshotRepository";
import { IQuoteProvider } from "../../domain/interfaces/IQuoteProvider";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { PortfolioDomainService } from "../../domain/services/PortfolioDomainService";
import { DateUtils } from "../../shared/utils/DateUtils";
import { normalizeOrderCodigo } from "../../../../common/utils/OrderCodigoUtils";
import { BusinessException } from "../../shared/exceptions/BusinessException";
import { ValidationException } from "../../shared/exceptions/ValidationException";

export class ImportOrdersService {
  constructor(
    private orderRepository: IOrderRepository,
    private portfolioRepository: IPortfolioRepository,
    private orderSellSnapshotRepository: IOrderSellSnapshotRepository,
    private quoteProvider: IQuoteProvider,
    private transactionManager: ITransactionManager,
    private portfolioDomainService: PortfolioDomainService
  ) {}

  public async validateAsync(orders: CreateOrderDto[]): Promise<ImportOrderValidationResult> {
    if (!orders.length) {
      throw new BusinessException("Planilha sem dados.");
    }

    const divergences: ImportOrderDivergence[] = [];

    await this.transactionManager.executeAsync(async (tx) => {
      for (const orderDto of orders) {
        this.validateOrder(orderDto);

        const codigoNormalizado = normalizeOrderCodigo(orderDto.codigo);
        const codigo = await this.portfolioDomainService.resolveCodigoForPortfolioAsync(codigoNormalizado, tx, this.portfolioRepository);

        if (orderDto.operacao === "Venda") {
          const validationResult = await this.portfolioDomainService.validateSellAsync(
            codigo,
            orderDto.quantidade,
            tx,
            this.portfolioRepository
          );

          if (validationResult.hasDivergence && validationResult.divergence) {
            divergences.push(validationResult.divergence);
          }
        }
      }
    });

    return {
      hasDivergences: divergences.length > 0,
      divergences,
    };
  }

  public async executeAsync(orders: CreateOrderDto[], confirmado: boolean = false): Promise<ImportOrderResult> {
    if (!orders.length) {
      throw new BusinessException("Planilha sem dados.");
    }

    if (!confirmado) {
      const validation = await this.validateAsync(orders);
      if (validation.hasDivergences) {
        throw new ValidationException(
          `Existem ${validation.divergences.length} divergência(s) que precisam ser confirmadas.`
        );
      }
    }

    const quotesMap = await this.fetchQuotes(orders);

    return await this.transactionManager.executeAsync(async (tx) => {
      let imported = 0;
      const warnings: string[] = [];

      for (const orderDto of orders) {
        this.validateOrder(orderDto);

        const codigoNormalizado = normalizeOrderCodigo(orderDto.codigo);
        const codigo = await this.portfolioDomainService.resolveCodigoForPortfolioAsync(codigoNormalizado, tx, this.portfolioRepository);

        const order = await this.orderRepository.createAsync(
          {
            codigo,
            quantidade: orderDto.quantidade,
            valor: orderDto.valor,
            data: orderDto.data,
            tipo: orderDto.tipo,
            operacao: orderDto.operacao,
          },
          tx
        );

        const result = await this.portfolioDomainService.updatePortfolioByOrderAsync(
          {
            orderId: order.id,
            codigo,
            quantidade: order.quantidade,
            valor: order.valor,
            operacao: order.operacao,
            data: order.data,
          },
          tx,
          this.portfolioRepository,
          this.orderSellSnapshotRepository,
          quotesMap.get(codigoNormalizado) ?? null,
          false
        );

        if (result.warning) {
          warnings.push(result.warning);
        }

        imported++;
      }

      return { imported, warnings };
    });
  }

  private validateOrder(orderDto: CreateOrderDto): void {
    if (!orderDto.codigo || !orderDto.quantidade || !orderDto.valor || !orderDto.data) {
      throw new ValidationException("Dados obrigatórios inválidos para importação de negociação.");
    }

    if (DateUtils.isFutureDate(orderDto.data)) {
      throw new ValidationException("Data futura não é permitida para negociação.");
    }
  }

  private async fetchQuotes(orders: CreateOrderDto[]): Promise<Map<string, number | null>> {
    const uniqueCodigos = [...new Set(orders.map(order => normalizeOrderCodigo(order.codigo)).filter(Boolean))];
    const quotesMap = new Map<string, number | null>();

    for (const codigo of uniqueCodigos) {
      const quote = await this.quoteProvider.getQuoteAsync(codigo);
      quotesMap.set(codigo, quote);
    }

    return quotesMap;
  }
}
