export interface ITransactionManager {
  executeAsync<T>(operation: (tx: unknown) => Promise<T>): Promise<T>;
}
