import { TriggerType } from "../actions/models/ActionTriggerTypes";
import { DataSourceDefinition } from "../actions/models/datasources/DataSourceDefinition";
import { DatasourceConfigTypes } from "../actions/models/datasources/DataSourceTypes";
import { FieldDescriptionTypes } from "../listItem/types/FieldDescriptionTypes";

export interface Logmodel {
  type: "FieldChanged" | "Action" | "Error" | "SaveOrUpdate" | "LoadForm";
  text: string;
  listItemContext?: any;
  datasource?: DataSourceDefinition;
  datasourceConfig?: DatasourceConfigTypes;
  fieldDescription?: FieldDescriptionTypes;
  trigger?: any;
  oldvalue?: any;
  newValue?: any;
  originalError?: any;
}
