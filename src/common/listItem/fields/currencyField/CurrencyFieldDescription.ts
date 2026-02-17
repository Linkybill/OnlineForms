import { FieldDescription } from "../base/FieldDescription";

export interface CurrencyFieldDescription extends FieldDescription<string> {
  currencyLocaleId: number;
  numberOfDecimals: number;
}
