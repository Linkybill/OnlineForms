import { ErrorViewModel } from "../../models/ErrorViewModel";
import { EditorModel } from "../../components/editor/models/EditorModel";
import { FormTemplateAssignmentViewModel, FormTemplateViewModel } from "../models/FormTemplateViewModel";

export interface IFormTemplateManager {
  loadUsedTemplate: (contentTypeId: string, usage: "NewForm" | "EditForm" | "DisplayForm", formInstanceId: number | undefined, formWebId: string) => Promise<ErrorViewModel<FormTemplateAssignmentViewModel | undefined>>;

  loadTemplate: (formTemplateListItemId: number, formWebId: string | undefined) => Promise<ErrorViewModel<FormTemplateViewModel | undefined>>;

  saveFormTemplate: (editorModel: EditorModel, formTemplateListItemId: number) => Promise<ErrorViewModel<{}>>;
}
