import { ListItem } from "../../../listItem/ListItem";
import { FieldDescription } from "../../../listItem/fields/base/FieldDescription";
import { FieldValueTypes } from "../../../listItem/types/FieldValueTypes";

export interface SharePointFormResult {
  formData: ListItem | undefined;
  formFields: FieldDescription<FieldValueTypes>[];
}
