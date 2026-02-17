import { FieldDescriptionTypes } from "../../types/FieldDescriptionTypes";
import { FieldValueTypes } from "../../types/FieldValueTypes";

export interface IFieldComponentProps<TPropertyFieldDescription extends FieldDescriptionTypes, TValue extends FieldValueTypes> {
  fieldDescription: TPropertyFieldDescription;
  fieldValue: TValue;
  rawData: any;
  editMode: boolean;
  renderAsTextOnly: boolean;
  validationErrors: string[];
  onValueChanged: (description: TPropertyFieldDescription, value: TValue | undefined, validationErrors?: string[]) => void;
  onBlur: (description: TPropertyFieldDescription, value: TValue | undefined, validationErrors?: string[]) => void;
}
