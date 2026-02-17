import { FieldDescriptionTypes } from "../../types/FieldDescriptionTypes";
import { ListItemField } from "../base/ListItemField";
import { CustomFieldListFieldDescription } from "./CustomFieldListFieldDescription";

export interface CustomFieldCreatorFieldProperty extends ListItemField<CustomFieldListFieldDescription, FieldDescriptionTypes[]> {}
