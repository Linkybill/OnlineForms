import { FieldTypeNames } from "../../../../listItem/FieldTypeNames";

export interface ParameterV2 {
  parameterName: string;
  displayName?: string;
  type: FieldTypeNames;
  location: string;
  isExpandable: boolean;
  pathIsEditableThroughTextField: boolean;
  children?: ParameterV2[];
  resolveChildren?: () => ParameterV2[];
}
