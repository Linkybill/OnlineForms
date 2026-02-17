import { FieldTypeNames } from "../common/listItem/FieldTypeNames";
import { FieldType } from "./efav2Client";
import { FieldTypeNumbers } from "./FieldTypes";

export const FieldTypeMapping: { [key: string]: FieldType } = {
  [FieldTypeNames.Text]: FieldTypeNumbers.Text,
  [FieldTypeNames.Lookup]: FieldTypeNumbers.Lookup,
  [FieldTypeNames.LookupMulti]: FieldTypeNumbers.Lookup, // assuming LookupMulti maps to Lookup
  [FieldTypeNames.Number]: FieldTypeNumbers.Number,
  [FieldTypeNames.User]: FieldTypeNumbers.User,
  [FieldTypeNames.UserMulti]: FieldTypeNumbers.User, // assuming UserMulti maps to User
  [FieldTypeNames.Boolean]: FieldTypeNumbers.Boolean,
  [FieldTypeNames.Choice]: FieldTypeNumbers.Choice,
  [FieldTypeNames.MultiChoice]: FieldTypeNumbers.MultiChoice,
  [FieldTypeNames.URL]: FieldTypeNumbers.URL,
  [FieldTypeNames.DateTime]: FieldTypeNumbers.DateTime,
  [FieldTypeNames.Currency]: FieldTypeNumbers.Currency,
  [FieldTypeNames.Note]: FieldTypeNumbers.Note,
  [FieldTypeNames.List]: FieldTypeNumbers.Invalid, // assuming List is not directly mapped
  [FieldTypeNames.File]: FieldTypeNumbers.File,
  [FieldTypeNames.Computed]: FieldTypeNumbers.Computed,
  [FieldTypeNames.CustomFieldList]: FieldTypeNumbers.Invalid, // assuming CustomFieldList is not directly mapped
  [FieldTypeNames.WebPicker]: FieldTypeNumbers.Invalid, // assuming WebPicker is not directly mapped
  [FieldTypeNames.ListPicker]: FieldTypeNumbers.Invalid, // assuming ListPicker is not directly mapped
  [FieldTypeNames.Button]: FieldTypeNumbers.Invalid, // assuming Button is not directly mapped
  [FieldTypeNames.LogicEditor]: FieldTypeNumbers.Invalid, // assuming LogicEditor is not directly mapped
  [FieldTypeNames.WorkflowStatus]: FieldTypeNumbers.Invalid,
  [FieldTypeNames.FormTemplaeEditor]: FieldTypeNumbers.Invalid, // assuming FormTemplateEditor is not directly mapped
  [FieldTypeNames.CustomTemplatedEntity]: FieldTypeNumbers.Invalid, // assuming CustomTemplatedEntity is not directly mapped
  [FieldTypeNames.FileUpload]: FieldTypeNumbers.Invalid // assuming FileUpload is not directly mapped
};
