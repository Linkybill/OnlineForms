export type DatasourceTriggerType = "DatasourceTrigger";
export type SetFieldValueTriggerType = "SetFieldValueTrigger";
export type SaveFormTriggerType = "SaveFormTrigger";
export type ContainerTriggerType = "ContainerTrigger";
export type CreateFormVersionTriggerType = "CreateFormVersionTrigger";
export type SharePointCreateListItemsTriggerType = "SharePointCreateListItemsTrigger";
export type SetRepeatedListFieldTriggerType = "SetRepeatedListFieldTrigger";

export type TriggerType =
  | DatasourceTriggerType
  | SetFieldValueTriggerType
  | SaveFormTriggerType
  | ContainerTriggerType
  | CreateFormVersionTriggerType
  | SharePointCreateListItemsTriggerType
  | SetRepeatedListFieldTriggerType;

export class TriggerTypes {
  static DatasourceTriggerType: DatasourceTriggerType = "DatasourceTrigger";
  static SetFieldValueTriggerType: SetFieldValueTriggerType = "SetFieldValueTrigger";
  static SaveFormTriggerType: SaveFormTriggerType = "SaveFormTrigger";
  static ContainerTriggerType: ContainerTriggerType = "ContainerTrigger";
  static CreateVersionTriggerType: CreateFormVersionTriggerType = "CreateFormVersionTrigger";
  static SharePointCreateListItemsTriggerType: SharePointCreateListItemsTriggerType = "SharePointCreateListItemsTrigger";
  static SetRepeatedListFieldTriggerType: SetRepeatedListFieldTriggerType = "SetRepeatedListFieldTrigger";
}
