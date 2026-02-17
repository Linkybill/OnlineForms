import { ListPickerFieldDescription } from "../fields/ListPickerField.tsx/ListPickerFieldDescription";
import { BooleanFieldDescription } from "../fields/booleanField/BooleanFieldDescription";
import { BUttonFieldDescription } from "../fields/buttonField/ButtonFieldDescription";
import { CustomFieldListFieldDescription } from "../fields/customFieldListField/CustomFieldListFieldDescription";
import { DateTimeFieldDescription } from "../fields/dateTimeField/DateTimeFieldDescription";
import { ChoiceFieldDescription } from "../fields/choiceField/ChoiceFieldDescription";
import { FileFieldDescription } from "../fields/fileField/FileFieldDescription";
import { ListFieldDescription } from "../fields/listField/ListFieldDescription";
import { LookupFieldDescription } from "../fields/lookupField/LookupFieldDescription";
import { NumberFieldDescription } from "../fields/numberField/NumberFieldDescription";
import { TextFieldDescription } from "../fields/textField/TextFieldDescription";
import { UrlFieldDescription } from "../fields/urlField/UrlFieldDescription";
import { UserFieldDescription } from "../fields/userField/UserFieldDescription";
import { WebPickerFieldDescription } from "../fields/webPickerField/WebPickerFieldDescription";
import { TemplateEditorFieldDescription } from "../fields/templateEditorField/TemplateEditorFieldDescription";
import { FileUploadFieldDescription } from "../fields/fileuploadField/FileUploadFieldDescription";

export type FieldDescriptionTypes =
  | BUttonFieldDescription
  | TextFieldDescription
  | NumberFieldDescription
  | UserFieldDescription
  | LookupFieldDescription
  | DateTimeFieldDescription
  | ChoiceFieldDescription
  | BooleanFieldDescription
  | UrlFieldDescription
  | ListFieldDescription
  | FileFieldDescription
  | CustomFieldListFieldDescription
  | WebPickerFieldDescription
  | TemplateEditorFieldDescription
  | ListPickerFieldDescription
  | FileUploadFieldDescription;
