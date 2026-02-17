import { TriggerType } from "./ActionTriggerTypes";
import { TriggerConfigType } from "./TriggerConfigType";

export interface ActionTrigger {
  triggerCondition: any | undefined;
  uniqueIdentifier: string;
  fieldNameWhichTriggersAction: string;
  type: TriggerType;
  title: string;
  description: string;
  config: TriggerConfigType;
  executionOrder: number;
}
