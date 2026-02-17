import { FieldDescriptionTypes } from "../../types/FieldDescriptionTypes";
import { FieldValueTypes } from "../../types/FieldValueTypes";

export interface ListItemField<TDescription extends FieldDescriptionTypes, TValue extends FieldValueTypes> {
  validationErrors?: string[];
  description: TDescription;
  value: TValue;
  rawSharePointData: any;
  valueChanged?: boolean;
}
