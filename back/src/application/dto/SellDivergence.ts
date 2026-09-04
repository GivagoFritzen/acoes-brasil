export interface SellDivergence {
  codigo: string;
  operacao: "Compra" | "Venda";
  quantidade: number;
  quantidadeDisponivel: number;
  mensagem: string;
}
