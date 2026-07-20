export interface ITransactionManager {
  executeAsync<T>(operation: (tx: object) => Promise<T>): Promise<T>;
}
