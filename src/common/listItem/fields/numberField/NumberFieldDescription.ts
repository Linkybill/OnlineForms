import { FieldDescription } from "../base/FieldDescription";

export interface NumberFieldDescription extends FieldDescription<string | number> {
  numberOfDecimals: number;
  labelSuffix?: string;
  labelPrefix?: string;
  inputSuffix?: string;
  inputPrefix?: string;
}
