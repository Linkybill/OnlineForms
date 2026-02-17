import { EditorModel } from "../../../components/editor/models/EditorModel";
import { ListItemField } from "../base/ListItemField";
import { TemplateEditorFieldDescription } from "./TemplateEditorFieldDescription";

export interface TemplateEditorFieldProperty extends ListItemField<TemplateEditorFieldDescription, EditorModel | undefined> {}
