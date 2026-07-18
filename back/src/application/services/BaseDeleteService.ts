import { NotFoundException } from "../../shared/exceptions/NotFoundException";

export abstract class BaseDeleteService<TEntity> {
  protected abstract getNotFoundMessage(): string;
  protected abstract findEntityAsync(id: string): Promise<TEntity | null>;
  protected abstract performDeleteAsync(entity: TEntity): Promise<void>;

  public async executeAsync(id: string): Promise<void> {
    const entity = await this.findEntityAsync(id);

    if (!entity) {
      throw new NotFoundException(this.getNotFoundMessage());
    }

    await this.performDeleteAsync(entity);
  }
}
