import { IPeoplePickerEntity } from "@pnp/sp/profiles";
import { IListItemFormUpdateValue } from "@pnp/sp/lists";
import log from "loglevel";
import { FieldTypeNames } from "../../../listItem/FieldTypeNames";
import { ListItem } from "../../../listItem/ListItem";
import { ListItemField } from "../../../listItem/fields/base/ListItemField";
import { LookupValue } from "../../../listItem/fields/valueTypes/LookupValue";
import { UrlValue } from "../../../listItem/fields/valueTypes/UrlValue";
import { UserFieldValue } from "../../../listItem/fields/valueTypes/UserFieldValue";
import { FieldDescriptionTypes } from "../../../listItem/types/FieldDescriptionTypes";
import { FieldValueTypes } from "../../../listItem/types/FieldValueTypes";
import { DateTimeValue } from "../../../listItem/fields/dateTimeField/DateTimeValue";
import { DateTimeDisplayMode, DateTimeFieldDescription } from "../../../listItem/fields/dateTimeField/DateTimeFieldDescription";

export class ListItemToUpdateHashMapper {
  public static mapListItemToToUpdateHash(listItem: ListItem, changedPropertiesOnly: boolean, listSchema?: FieldDescriptionTypes[]): any {
    const valueObject: any = {};
    let propsToMap = changedPropertiesOnly ? listItem.getChangedProperties() : listItem.getProperties();
    propsToMap = propsToMap.filter((prop) => prop.description.isReadOnly !== true);
    propsToMap.forEach((prop) => {
      let propToUseForMapping = prop;
      if (listSchema !== undefined) {
        const fieldsFromSchema = listSchema.filter((field) => field.internalName === prop.description.internalName);
        if (fieldsFromSchema.length === 10) {
          propToUseForMapping = {
            ...prop,
            description: fieldsFromSchema[0]
          };
        }
      }
      var value = this.mapPropertyToListItemFormHashValue(propToUseForMapping);
      valueObject[propToUseForMapping.description.internalName] = value;
    });
    return valueObject;
  }
  private static mapPropertyToListItemFormHashValue(prop: ListItemField<FieldDescriptionTypes, FieldValueTypes>): any {
    switch (prop.description.type) {
      case FieldTypeNames.Number:
      case FieldTypeNames.Text:
      case FieldTypeNames.Note:
      case FieldTypeNames.Currency:
        return prop.value ? prop.value.toString() : "";

      case FieldTypeNames.Boolean:
        return prop.value;

      case FieldTypeNames.Choice:
        const vals = prop.value as string[];
        if (vals.length > 0) {
          return vals[0];
        }

        return undefined;
      case FieldTypeNames.MultiChoice:
        const values = prop.value as string[];
        return values;

      case FieldTypeNames.DateTime:
        if (prop.value === undefined || (prop.value as DateTimeValue).date === undefined) {
          return undefined;
        }

        const dateTimeValue = prop.value as DateTimeValue;

        let dateToSend = dateTimeValue.date;

        if (dateTimeValue.time !== undefined && (prop.description as DateTimeFieldDescription).displayMode === DateTimeDisplayMode.DateAndTime) {
          dateToSend.setHours(dateTimeValue.time.getHours(), dateTimeValue.time.getMinutes(), dateTimeValue.time.getSeconds(), dateTimeValue.time.getMilliseconds());
        }
        return dateToSend;

      case FieldTypeNames.Lookup:
        const val = prop.value as LookupValue[];
        if (val.length > 0) {
          return val[0].lookupId;
        }
      case FieldTypeNames.LookupMulti:
      case FieldTypeNames.List:
        return (prop.value as LookupValue[]).map((lookup) => lookup.lookupId);

      case FieldTypeNames.User:
        var usrValues = prop.value as UserFieldValue[];
        if (usrValues.length > 0) {
          return usrValues[0].id;
        }
        return undefined;
      case FieldTypeNames.UserMulti:
        const uservalues = prop.value as UserFieldValue[];

        return uservalues.map((val) => val.id);

      case FieldTypeNames.URL:
        const value: { Description: string; Url: string } | undefined =
          (prop.value as UrlValue | undefined) !== undefined
            ? {
                Description: (prop.value as UrlValue).text,
                Url: (prop.value as UrlValue).url
              }
            : undefined;

        if (value == undefined) {
          return undefined;
        }
        return {
          __metadata: { type: "SP.FieldUrlValue" },
          Description: value.Description,
          Url: value.Url
        };
      default: {
        log.error("error during item update", prop);
        throw new Error("could not update field");
      }
    }
  }
}
