import { FieldTypeNames } from "../../listItem/FieldTypeNames";

export interface Filter {
  fieldType: string;
  fieldName: string;
  values: string[];
}
