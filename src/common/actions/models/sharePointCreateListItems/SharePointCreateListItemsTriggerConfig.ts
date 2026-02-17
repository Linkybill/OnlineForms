import { ParameterMapping } from "../datasources/ParameterMapping";

export interface SharePointCreateListItemsTriggerConfig {
  webUrl: string;
  listName: string;
  createMultipleItems: boolean;
  multipleItemsSourcePath?: string;
  parameterMappings: ParameterMapping[];
}
