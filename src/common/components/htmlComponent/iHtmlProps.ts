import { FieldDescription } from "../../listItem/fields/base/FieldDescription";
import { FieldDescriptionTypes } from "../../listItem/types/FieldDescriptionTypes";
import { FieldValueTypes } from "../../listItem/types/FieldValueTypes";
import { ComponentConfig } from "../componentProxy/models/componentConfig";

export interface IHtmlProps {
  uniqueKey: string;
  html: string;
  onComponentUpdated?: (componentProps: ComponentConfig) => void;
  tokenEditorSchema: FieldDescriptionTypes[];
  htmlWithTokens: string;
  listItemForTokenValues: any;
}
