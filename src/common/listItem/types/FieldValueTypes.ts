import { EditorModel } from "../../components/editor/models/EditorModel";
import { ButtonValue } from "../fields/buttonField/ButtonField";
import { DateTimeValue } from "../fields/dateTimeField/DateTimeValue";
import { FileFieldValue } from "../fields/fileField/FileFieldValue";
import { FileValue } from "../fields/fileuploadField/FileUploadFieldValue";
import { LookupValue } from "../fields/valueTypes/LookupValue";
import { UrlValue } from "../fields/valueTypes/UrlValue";
import { UserFieldValue } from "../fields/valueTypes/UserFieldValue";
import { FieldDescriptionTypes } from "./FieldDescriptionTypes";

export type FieldValueTypes =
  | (boolean | undefined)
  | number
  | string
  | string[] // for choices
  | (Date | undefined)
  | LookupValue[]
  | (UrlValue | undefined)
  | UserFieldValue[]
  | (EditorModel | undefined)
  | any[]
  | FileFieldValue
  | undefined
  | FieldDescriptionTypes[]
  | DateTimeValue
  | ButtonValue
  | FileValue[];
