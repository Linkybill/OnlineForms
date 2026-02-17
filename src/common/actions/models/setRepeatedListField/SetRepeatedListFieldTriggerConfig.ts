import { ParameterMapping } from "../datasources/ParameterMapping";

export interface SetRepeatedListFieldTriggerConfig {
  targetListFieldPath: string;
  createMultipleItems: boolean;
  multipleItemsSourcePath?: string;
  parameterMappings: ParameterMapping[];
}
