import { FieldDescription } from "../base/FieldDescription";
import { FileValue } from "./FileUploadFieldValue";

export interface FileUploadFieldDescription extends FieldDescription<FileValue[]> {
  allowMultipleFiles: boolean;
}
