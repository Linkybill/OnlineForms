import { ListItemField } from "../base/ListItemField";
import { DateTimeFieldDescription } from "./DateTimeFieldDescription";
import { DateTimeValue } from "./DateTimeValue";

export interface DateTimeFieldProperty extends ListItemField<DateTimeFieldDescription, DateTimeValue | undefined> {}
