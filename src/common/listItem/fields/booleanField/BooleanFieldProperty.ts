import { ListItemField } from "../base/ListItemField";
import { BooleanFieldDescription } from "./BooleanFieldDescription";

export interface BooleanFieldProperty extends ListItemField<BooleanFieldDescription, boolean | undefined> {}
