import { FieldTypeNames } from "../../../../listItem/FieldTypeNames";

export interface Parameter {
  path: string;
  parameterName: string;
  type: FieldTypeNames;
  location: string;
}
