import { FieldDescription } from "../base/FieldDescription";
import { EditorModel } from "../../../components/editor/models/EditorModel";

export interface CustomTemplatedListFieldDescription extends FieldDescription<any[] | undefined> {
  editorModel: EditorModel;
  newItemLabel?: string;
  fieldNamesToShowInList?: string[];
}
