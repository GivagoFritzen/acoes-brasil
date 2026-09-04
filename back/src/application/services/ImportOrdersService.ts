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
import { translationService } from "../../shared/i18n/TranslationService";

export class ImportOrdersService {
  constructor(
    private orderRepository: IOrderRepository,
    private portfolioRepository: IPortfolioRepository,
    private orderSellSnapshotRepository: IOrderSellSnapshotRepository,
    private quoteProvider: IQuoteProvider,
    private transactionManager: ITransactionManager,
    private portfolioDomainService: PortfolioDomainService
  ) {}

  public async validateAsync(orders: CreateOrderDto[], lang: string): Promise<ImportOrderValidationResult> {
    if (!orders.length) {
      throw new BusinessException(translationService.translate('import.sheetWithoutData', lang));
    }

    const divergences: ImportOrderDivergence[] = [];

    await this.transactionManager.executeAsync(async (tx) => {
      for (const orderDto of orders) {
        this.validateOrder(orderDto, lang);

        const codigoNormalizado = normalizeOrderCodigo(orderDto.codigo);
        const codigo = await this.portfolioDomainService.resolveCodigoForPortfolioAsync(codigoNormalizado, tx, this.portfolioRepository);

        if (orderDto.operacao === "Venda") {
          const validationResult = await this.portfolioDomainService.validateSellAsync(
            codigo,
            orderDto.quantidade,
            lang,
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

  public async executeAsync(orders: CreateOrderDto[], lang: string, confirmado: boolean = false): Promise<ImportOrderResult> {
    if (!orders.length) {
      throw new BusinessException(translationService.translate('import.sheetWithoutData', lang));
    }

    if (!confirmado) {
      const validation = await this.validateAsync(orders, lang);
      if (validation.hasDivergences) {
        throw new ValidationException(
          translationService.translate('import.divergencesPending', lang, { count: validation.divergences.length })
        );
      }
    }

    const quotesMap = await this.fetchQuotes(orders);

    return await this.transactionManager.executeAsync(async (tx) => {
      let imported = 0;
      const warnings: string[] = [];

      for (const orderDto of orders) {
        this.validateOrder(orderDto, lang);

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
            quantidade: orderDto.quantidade,
            valor: orderDto.valor,
            operacao: orderDto.operacao,
            data: orderDto.data,
          },
          lang,
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

  private validateOrder(orderDto: CreateOrderDto, lang?: string): void {
    if (!orderDto.codigo || !orderDto.quantidade || !orderDto.valor || !orderDto.data) {
      throw new ValidationException(translationService.translate('import.invalidRequiredFields', lang));
    }

    if (DateUtils.isFutureDate(orderDto.data)) {
      throw new ValidationException(translationService.translate('import.futureDateNotAllowed', lang));
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
