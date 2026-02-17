import log from "loglevel";
import { FieldTypeNames } from "../../../listItem/FieldTypeNames";
import { ListItemField } from "../../../listItem/fields/base/ListItemField";
import { LookupValue } from "../../../listItem/fields/valueTypes/LookupValue";
import { UrlValue } from "../../../listItem/fields/valueTypes/UrlValue";
import { UserFieldValue } from "../../../listItem/fields/valueTypes/UserFieldValue";
import { FieldDescriptionTypes } from "../../../listItem/types/FieldDescriptionTypes";
import { FieldValueTypes } from "../../../listItem/types/FieldValueTypes";

export const mapPropertyToFilterStringRepresentation = (listItemField: ListItemField<FieldDescriptionTypes, FieldValueTypes>): string[] => {
  switch (listItemField.description.type) {
    case FieldTypeNames.Text:
    case FieldTypeNames.Number:
      return [listItemField.value as string];
    case FieldTypeNames.URL:
      return [(listItemField.value as UrlValue).url];
    case FieldTypeNames.DateTime:
      const date = listItemField.value as Date | undefined;
      return [date !== undefined ? date.toLocaleDateString() : ""];
    case FieldTypeNames.Choice:
    case FieldTypeNames.MultiChoice:
      return listItemField.value as string[];
    case FieldTypeNames.Lookup:
    case FieldTypeNames.LookupMulti:
      return (listItemField.value as LookupValue[]).map((val) => val.value);
    case FieldTypeNames.Boolean:
      const val: boolean | undefined = listItemField.value as boolean | undefined;
      return val === undefined || val === false ? ["Nein"] : ["Ja"];
    case FieldTypeNames.User:
    case FieldTypeNames.UserMulti:
      return (listItemField.value as UserFieldValue[]).map((user) => user.title);
    default:
      log.error("could not filter field ", listItemField);
      throw new Error("could not filter field");
  }
};
