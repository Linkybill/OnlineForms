import { FieldDescription } from "../base/FieldDescription";
import { ButtonValue } from "./ButtonField";

export interface BUttonFieldDescription extends FieldDescription<ButtonValue> {
  isIconButton?: boolean;
  iconName?: string;
  isPrimaryButton: boolean;
}
