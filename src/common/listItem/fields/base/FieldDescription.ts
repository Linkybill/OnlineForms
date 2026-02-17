import { FieldValueTypes } from "../../types/FieldValueTypes";
import { ValidationRule } from "./ValidationRule";

export interface FieldDescription<T extends FieldValueTypes> {
  internalName: string;
  displayName: string;
  type: string;
  required: boolean;
  description: string;
  isReadOnly?: boolean;
  defaultValue: T;
  lockedWhenCondition?: string;
  requiredWhenCondition?: string;
  validationRules?: ValidationRule[];
  uniqueKey: string;
  expressionForMessageWhileActionsAreRunning?: string;
}
