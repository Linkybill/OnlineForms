import { EditorModel } from "../components/editor/models/EditorModel";

export interface IEditorContextProviderProps {
  uniqueComponentKeys: string[];
  initialEditorModel: EditorModel;
  isInEditMode: boolean;
}
