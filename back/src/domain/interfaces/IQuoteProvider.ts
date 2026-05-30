export interface IQuoteProvider {
  getQuoteAsync(codigo: string): Promise<number | null>;
}
