import { FieldDescription } from "../base/FieldDescription";
import { FieldDescriptionTypes } from "../../types/FieldDescriptionTypes";

export interface ListPickerFieldDescription extends FieldDescription<string> {
  propertyNameForWebIdFromItemContext?: string;
  webId?: string;
  serverRelativeWebUrl?: string;
}
