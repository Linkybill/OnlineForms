import { ListItemField } from "../base/ListItemField";
import { FileUploadFieldDescription } from "./FileUploadFieldDescription";
import { FileValue } from "./FileUploadFieldValue";

export interface FileUploadFieldProperty extends ListItemField<FileUploadFieldDescription, FileValue[] | undefined> {}
