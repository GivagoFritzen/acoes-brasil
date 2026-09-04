export interface ImportDivergence {
    codigo: string;
    operacao: 'Compra' | 'Venda';
    quantidade: number;
    quantidadeDisponivel: number;
    mensagem: string;
}
