import { IFieldComponentProps } from "../base/FieldComponentProps";
import { FileUploadFieldDescription } from "./FileUploadFieldDescription";
import { FileValue } from "./FileUploadFieldValue";

export interface IFileUploadFIeldProps extends IFieldComponentProps<FileUploadFieldDescription, FileValue[]> {}
