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

export class ListItemToListItemFormUpdateValuesMapper {
  public static mapListItemToToFormUpdateValues(listItem: ListItem, changedPropertiesOnly: boolean, listSchema?: FieldDescriptionTypes[]): IListItemFormUpdateValue[] {
    const values: IListItemFormUpdateValue[] = [];
    let propsToMap = changedPropertiesOnly ? listItem.getChangedProperties() : listItem.getProperties();
    propsToMap = propsToMap.filter((prop) => prop.description.isReadOnly !== true);
    propsToMap.forEach((prop) => {
      let propToUseForMapping = prop;

      if (listSchema !== undefined) {
        const fieldsFromSchema = listSchema.filter((field) => field.internalName === prop.description.internalName);
        // this code is a bug, in if .length === 10 the block never gets executed and it potentially schould get removed cause it was not nessessary until now
        if (fieldsFromSchema.length === 10) {
          propToUseForMapping = {
            ...prop,
            description: fieldsFromSchema[0]
          };
        }
      }
      values.push(this.mapPropertyToListItemFormUpdateValue(propToUseForMapping));
    });
    return values;
  }
  private static mapPropertyToListItemFormUpdateValue(prop: ListItemField<FieldDescriptionTypes, FieldValueTypes>): IListItemFormUpdateValue {
    try {
      switch (prop.description.type) {
        case FieldTypeNames.Number:
        case FieldTypeNames.Text:
        case FieldTypeNames.Note:
        case FieldTypeNames.Currency:
          return {
            FieldName: prop.description.internalName,
            FieldValue: prop.value ? prop.value.toString() : undefined
          };

        case FieldTypeNames.Boolean:
          let booleanRepresentation: string | undefined = undefined;
          if (prop.value !== undefined && prop.value !== null) {
            const val: any = prop.value as any;
            const normalized =
              val === true || val === 1 || val === "1" || val === "true" || val === "True" || val === "Ja"
                ? true
                : val === false || val === 0 || val === "0" || val === "false" || val === "False" || val === "Nein"
                ? false
                : undefined;
            if (normalized !== undefined) {
              booleanRepresentation = normalized === true ? "1" : "0";
            }
          }
          return {
            FieldName: prop.description.internalName,
            FieldValue: booleanRepresentation
          };

        case FieldTypeNames.Choice:
        case FieldTypeNames.MultiChoice:
          const values = prop.value as string[];

          let stringRepresentation: string = "";
          if (values.length === 1) {
            stringRepresentation = values[0];
          }
          if (values.length > 1) {
            stringRepresentation = ";#" + values.join(";#") + ";#";
          }

          return {
            FieldName: prop.description.internalName,
            FieldValue: stringRepresentation
          };

        case FieldTypeNames.DateTime:
          if (prop.value === undefined || (prop.value as DateTimeValue).date === undefined) {
            return {
              FieldName: prop.description.internalName,
              FieldValue: undefined
            };
          }

          const dateTimeValue = prop.value as DateTimeValue;

          let dateToSend = dateTimeValue.date;

          if (dateTimeValue.time !== undefined && (prop.description as DateTimeFieldDescription).displayMode === DateTimeDisplayMode.DateAndTime) {
            dateToSend.setHours(dateTimeValue.time.getHours(), dateTimeValue.time.getMinutes(), dateTimeValue.time.getSeconds(), dateTimeValue.time.getMilliseconds());
          }
          return {
            FieldName: prop.description.internalName,
            FieldValue: dateToSend.toLocaleDateString() + " " + dateToSend.toLocaleTimeString()
          };

        case FieldTypeNames.Lookup:
        case FieldTypeNames.LookupMulti:
        case FieldTypeNames.List:
          return {
            FieldName: prop.description.internalName,
            FieldValue: (prop.value as LookupValue[]).map((lookup) => lookup.lookupId + ";#" + lookup.value).join(";#")
          };
        case FieldTypeNames.User:
        case FieldTypeNames.UserMulti:
          const userValues = prop.value as UserFieldValue[];
          if (userValues !== undefined) {
            const spRepresentation: IPeoplePickerEntity[] = userValues.map((val): IPeoplePickerEntity => {
              return { DisplayText: val.title, Key: val.id } as any;
            });
            return {
              FieldName: prop.description.internalName,
              FieldValue: JSON.stringify(spRepresentation)
            };
          }
          return { FieldName: prop.description.internalName, FieldValue: JSON.stringify([]) };

        case FieldTypeNames.URL:
          const value: { Description: string; Url: string } | undefined =
            (prop.value as UrlValue | undefined) !== undefined
              ? {
                  Description: (prop.value as UrlValue).text,
                  Url: (prop.value as UrlValue).url
                }
              : undefined;
          return {
            FieldName: prop.description.internalName,
            FieldValue: value !== undefined ? value.Url + ", " + value.Description : ""
          };

        default: {
          log.error("error during item update", prop);
          throw new Error("could not update field");
        }
      }
    } catch (e) {
      log.debug("could not map property to sharepoint form updatevalue", { error: e, prop: prop });
      throw e;
    }
  }
}
