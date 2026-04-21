import { OrderEntity } from "../../domain/entities/OrderEntity";
import { IOrderRepository } from "../../domain/interfaces/IOrderRepository";
import { IOrderSellSnapshotRepository } from "../../domain/interfaces/IOrderSellSnapshotRepository";
import { IPortfolioRepository } from "../../domain/interfaces/IPortfolioRepository";
import { IQuoteProvider } from "../../domain/interfaces/IQuoteProvider";
import { ITransactionManager } from "../../domain/interfaces/ITransactionManager";
import { CreateOrderDto } from "../dto/CreateOrderDto";
import { DateUtils } from "../../shared/utils/DateUtils";

export class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private portfolioRepository: IPortfolioRepository,
    private orderSellSnapshotRepository: IOrderSellSnapshotRepository,
    private quoteProvider: IQuoteProvider,
    private transactionManager: ITransactionManager
  ) {}

  public async executeAsync(input: CreateOrderDto): Promise<OrderEntity> {
    const { quantidade, valor, operacao, data, tipo, nome } = input;
    const codigoInput = input.codigo.trim().toUpperCase();

    if (!codigoInput || !quantidade || !valor || !data) {
      throw new Error("Dados inválidos para criar order. Informe código, quantidade, valor e data.");
    }

    if (DateUtils.isFutureBrDate(data)) {
      throw new Error("A data da ordem não pode ser futura.");
    }

    if (operacao !== "Compra" && operacao !== "Venda") {
      throw new Error("Operação inválida para portfolio. Use Compra ou Venda.");
    }

    return await this.transactionManager.executeAsync(async (tx) => {
      const codigo = await this.resolveCodigoForSellAsync(codigoInput, operacao, tx);
      const nomeEmpresa = nome ? nome.trim() : codigo;

      if (operacao === "Venda") {
        await this.rebuildPortfolioByCodigoAsync(codigo, tx);
      }

      const orderData = {
        codigo,
        quantidade,
        valor,
        data,
        tipo,
        operacao,
      };

      const order = await this.orderRepository.createAsync(orderData, tx);

      await this.updatePortfolioByOrderAsync(
        {
          orderId: order.id,
          codigo,
          nome: nomeEmpresa,
          quantidade,
          valor,
          operacao,
          data: order.data,
        },
        tx
      );

      return order;
    });
  }


  private async resolveCodigoForSellAsync(codigo: string, operacao: "Compra" | "Venda", tx: unknown): Promise<string> {
    if (operacao !== "Venda") {
      return codigo;
    }

    const portfolioExact = await this.portfolioRepository.findByCodigoAsync(codigo, tx);
    if (portfolioExact) {
      return codigo;
    }

    if (!codigo.endsWith("F")) {
      const codigoFracionario = `${codigo}F`;
      const portfolioFracionario = await this.portfolioRepository.findByCodigoAsync(codigoFracionario, tx);
      if (portfolioFracionario) {
        return codigoFracionario;
      }
    }

    return codigo;
  }

  private async rebuildPortfolioByCodigoAsync(codigo: string, tx: unknown): Promise<void> {
    const orders = await this.orderRepository.findAllByCodigoAsync(codigo, tx);
    
    let quantidadeAtual = 0;
    let precoMedioAtual = 0;

    for (const order of orders) {
      const quantidade = order.quantidade;
      const valor = order.valor;

      if (order.operacao === "Compra") {
        const novaQuantidade = quantidadeAtual + quantidade;
        precoMedioAtual =
          novaQuantidade > 0
            ? (quantidadeAtual * precoMedioAtual + quantidade * valor) / novaQuantidade
            : 0;
        quantidadeAtual = novaQuantidade;
        continue;
      }

      quantidadeAtual -= quantidade;

      if (quantidadeAtual < 0) {
        throw new Error("A remoção da ordem deixaria o portfolio inconsistente.");
      }

      if (quantidadeAtual === 0) {
        precoMedioAtual = 0;
      }
    }

    const portfolio = await this.portfolioRepository.findByCodigoAsync(codigo, tx);

    if (quantidadeAtual <= 0) {
      if (portfolio) {
        await this.portfolioRepository.deleteByCodigoAsync(codigo, tx);
      }
      return;
    }

    if (!portfolio) {
      await this.portfolioRepository.createAsync(
        {
          codigo,
          nome: codigo,
          quantidade: quantidadeAtual,
          precoMedio: precoMedioAtual,
        },
        tx
      );
      return;
    }

    portfolio.quantidade = quantidadeAtual;
    portfolio.precoMedio = precoMedioAtual;
    await this.portfolioRepository.saveAsync(portfolio, tx);
  }

  private async updatePortfolioByOrderAsync(
    input: {
      orderId: string;
      codigo: string;
      nome: string;
      quantidade: number;
      valor: number;
      operacao: "Compra" | "Venda";
      data: string;
    },
    tx: unknown
  ): Promise<void> {
    const { orderId, codigo, nome, quantidade, valor, operacao, data } = input;

    let portfolio = await this.portfolioRepository.findByCodigoAsync(codigo, tx);

    if (!portfolio) {
      if (operacao === "Venda") {
        throw new Error(`Não é possível vender ativo (${codigo}) que não existe no portfolio.`);
      }

      await this.portfolioRepository.createAsync(
        {
          codigo,
          nome: nome || codigo,
          quantidade,
          precoMedio: valor,
        },
        tx
      );
      return;
    }

    if (operacao === "Compra") {
      portfolio.registerCompra(quantidade, valor, nome);
      await this.portfolioRepository.saveAsync(portfolio, tx);
    } else {
      const precoMedioAtual = portfolio.precoMedio;
      portfolio.registerVenda(quantidade);

      const quoteFromFundamentus = await this.quoteProvider.getQuoteAsync(codigo);
      const valorReferencia = quoteFromFundamentus ?? valor;
      const custoMedioTotal = precoMedioAtual * quantidade;
      const valorReferenciaTotal = valorReferencia * quantidade;
      const ganhos = valorReferenciaTotal - custoMedioTotal;

      if (!Number.isFinite(ganhos)) {
        throw new Error("Não foi possível calcular lucro/prejuízo da venda.");
      }

      const teveLucro = ganhos >= 0;

      await this.orderSellSnapshotRepository.createAsync(
        {
          orderId,
          codigo,
          precoMedioAtual,
          quantidade,
          valorAtualAcao: valorReferencia,
          ganhos,
          teveLucro,
          data,
        },
        tx
      );

      await this.portfolioRepository.saveAsync(portfolio, tx);
    }
  }
}
