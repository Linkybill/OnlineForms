import { EditorModel } from "../../components/editor/models/EditorModel";

export interface FormTemplateViewModel {
  editorModel: EditorModel | undefined;
  title: string;
  webId: string | undefined;
  listId: string | undefined;
  contentTypeId: string | undefined;
  formTemplateListItemId: number;
}

export interface FormTemplateAssignmentViewModel {
  templateViewModel: FormTemplateViewModel;
  assignmentListItemId: number;
}

export interface TemplateAssignmentInfo {
  assignedDefaultTemplate: FormTemplateAssignmentViewModel | undefined;
  assignedTemplate: FormTemplateAssignmentViewModel | undefined;
}
