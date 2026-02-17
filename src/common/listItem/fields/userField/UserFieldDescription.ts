import { FieldDescription } from "../base/FieldDescription";
import { UserFieldValue } from "../valueTypes/UserFieldValue";

export interface UserFieldDescription extends FieldDescription<UserFieldValue[]> {
  groupId: number | undefined;
  allowGroupSelection: boolean;
  canSelectMultipleItems: boolean;
}
