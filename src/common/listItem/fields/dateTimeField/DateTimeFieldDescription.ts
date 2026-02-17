import { FieldDescription } from "../base/FieldDescription";
import { DateTimeValue } from "./DateTimeValue";

export enum DateTimeDisplayMode {
  DateOnly = 0,
  DateAndTime = 1
}

export interface DateTimeFieldDescription extends FieldDescription<DateTimeValue | undefined> {
  displayMode: DateTimeDisplayMode;
}
