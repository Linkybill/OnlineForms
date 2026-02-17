import { FieldDescription } from "../base/FieldDescription";
import { LookupValue } from "../valueTypes/LookupValue";

export interface LookupFieldDescription extends FieldDescription<LookupValue[]> {
  lookupField: string;
  lookupListId: string;
  lookupWebId: string;
  canSelectMultipleItems: boolean;
}
