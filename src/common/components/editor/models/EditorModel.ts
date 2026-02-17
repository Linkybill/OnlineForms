import { ActionTrigger } from "../../../actions/models/ActionTrigger";
import { DataSourceDefinition } from "../../../actions/models/datasources/DataSourceDefinition";
import { FieldDescriptionTypes } from "../../../listItem/types/FieldDescriptionTypes";
import { ComponentConfig } from "../../componentProxy/models/componentConfig";

export interface EditorModel {
  uniqueComponentKeys: string[];
  componentConfig: ComponentConfig | null;
  customFieldDefinitions: FieldDescriptionTypes[];
  datasources: DataSourceDefinition[];
  fieldTriggers: ActionTrigger[];
  startupTriggers: ActionTrigger[];
  saveTriggers: ActionTrigger[];
  containerFieldsAreLockedConditions: { [key: string]: string };
  containerHiddenWhenConditions: { [key: string]: string };
  ignoreFieldsInItemJSON?: string[];
  mirroredSPListFields?: string[];
}
