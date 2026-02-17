import { ListItemField } from "../base/ListItemField";
import { FileFieldDescription } from "./FileFieldDescription";
import { FileFieldValue } from "./FileFieldValue";

export interface FileFieldProperty extends ListItemField<FileFieldDescription, FileFieldValue> {}
