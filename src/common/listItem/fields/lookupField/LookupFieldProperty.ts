import { ListItemField } from "../base/ListItemField";
import { LookupValue } from "../valueTypes/LookupValue";
import { LookupFieldDescription } from "./LookupFieldDescription";

export interface LookupFieldProperty extends ListItemField<LookupFieldDescription, LookupValue[]> {}
