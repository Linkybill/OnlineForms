import { FieldDescription } from "../base/FieldDescription";
import { FieldDescriptionTypes } from "../../types/FieldDescriptionTypes";
import { EditorModel } from "../../../components/editor/models/EditorModel";
import { CustomFieldListFieldDescription } from "../customFieldListField/CustomFieldListFieldDescription";

export interface TemplateEditorFieldDescription extends FieldDescription<EditorModel | undefined> {}
