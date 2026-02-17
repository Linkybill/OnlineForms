import { ContainerTriggerConfig } from "./ContainerTrigger/ContainerTriggerConfig";
import { CreateFormVersionTriggerConfig } from "./createFormVersion/CreateFormVersionTriggerConfig";
import { DatasourceTriggerConfig } from "./datasources/DatasourceTriggerConfig";
import { SaveFormTriggerConfig } from "./saveFormTrigger/SaveFormTriggerConfig";
import { SetFieldValueTriggerConfig } from "./setFieldValue/SetFieldValueTriggerConfig";
import { SharePointCreateListItemsTriggerConfig } from "./sharePointCreateListItems/SharePointCreateListItemsTriggerConfig";
import { SetRepeatedListFieldTriggerConfig } from "./setRepeatedListField/SetRepeatedListFieldTriggerConfig";

export type TriggerConfigType =
  | DatasourceTriggerConfig
  | SetFieldValueTriggerConfig
  | SaveFormTriggerConfig
  | ContainerTriggerConfig
  | CreateFormVersionTriggerConfig
  | SharePointCreateListItemsTriggerConfig
  | SetRepeatedListFieldTriggerConfig;
