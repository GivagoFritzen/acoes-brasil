export interface ImportOrderDivergence {
  codigo: string;
  operacao: "Compra" | "Venda";
  quantidade: number;
  quantidadeDisponivel: number;
  mensagem: string;
}
