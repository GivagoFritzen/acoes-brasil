export class TranslationKeyError extends Error {
  constructor(
    message: string,
    public readonly translationKey: string,
    public readonly translationParams?: Record<string, string | number>
  ) {
    super(message);
    this.name = 'TranslationKeyError';
  }
}
