import { FieldDescription } from "../base/FieldDescription";
import { FieldDescriptionTypes } from "../../types/FieldDescriptionTypes";
import { EditorModel } from "../../../components/editor/models/EditorModel";

export interface ListFieldDescription extends FieldDescription<any[] | undefined> {
  itemProperties: FieldDescriptionTypes[];
  newItemLabel?: string;
  itemTemplate?: string;
  outerTemplate?: string;
  editorModel?: EditorModel;
}
