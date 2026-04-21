export interface SelectOption<TValue extends string = string> {
  label: string;
  value: TValue;
}