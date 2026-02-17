import { EditorModel } from "../../../common/components/editor/models/EditorModel";

export interface FormTemplate {
  title: string;
  description: string;
  templateIdenfitier: string;
  templateVersionIdentifier: string;
  validFrom: Date;
  validUntil: Date;
  id?: number;
  editorModel?: EditorModel;
  currentETag: string;
}
