import { IFieldComponentProps } from "../base/FieldComponentProps";
import { DateTimeFieldDescription } from "./DateTimeFieldDescription";
import { DateTimeValue } from "./DateTimeValue";

export interface IDateTimeFIeldProps extends IFieldComponentProps<DateTimeFieldDescription, DateTimeValue | undefined> {}
