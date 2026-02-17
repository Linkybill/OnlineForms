import { DateTimeDisplayMode, DateTimeFieldDescription } from "../../../../listItem/fields/dateTimeField/DateTimeFieldDescription";
import { DateTimeValue } from "../../../../listItem/fields/dateTimeField/DateTimeValue";
import { FieldTypeNames } from "../../../../listItem/FieldTypeNames";
import { ListItem } from "../../../../listItem/ListItem";

export const validateRequiredFieldsOnListItem = (listItemValue: ListItem, fieldSchema: FieldTypeNames[]): ListItem => {
  listItemValue.getProperties().forEach((itemProp) => {
    if (itemProp.description.required === true) {
      let requiredValidationMessageAdded = false;
      const existingValidationErrors = itemProp.validationErrors !== undefined && itemProp.validationErrors !== null ? itemProp.validationErrors : [];

      if (itemProp.description.type === FieldTypeNames.DateTime) {
        const dateTimeValue = itemProp.value as DateTimeValue;
        if (dateTimeValue === undefined || dateTimeValue.date === undefined) {
          listItemValue.setErrors(itemProp.description.internalName, [...existingValidationErrors, "Bitte ein Datum auswählen"]);
          requiredValidationMessageAdded = true;
        }

        if ((itemProp.description as DateTimeFieldDescription).displayMode === DateTimeDisplayMode.DateAndTime && (dateTimeValue === undefined || dateTimeValue.time === undefined)) {
          if (requiredValidationMessageAdded === false) {
            listItemValue.setErrors(itemProp.description.internalName, [...existingValidationErrors, "Bitte ein Datum mit Uhrzeit auswählen"]);
          }
        }
      }
      if (
        itemProp.value === undefined ||
        itemProp.value === null ||
        (Array.isArray(itemProp.value) && itemProp.value.length === 0) ||
        itemProp.value === "" ||
        (itemProp.description.type === FieldTypeNames.Boolean && itemProp.value !== true)
      ) {
        if (requiredValidationMessageAdded === false) {
          listItemValue.setErrors(itemProp.description.internalName, [...existingValidationErrors, "Bitte einen Wert eingeben"]);
        }
      }
      if (Array.isArray(itemProp.value) && itemProp.value.length > 0) {
        for (var i = 0; i < itemProp.value.length; i++) {
          const val = itemProp.value[i];
          if (val === undefined || val === null || (typeof val === "string" && val.trim() == "")) {
            if (requiredValidationMessageAdded === false) {
              listItemValue.setErrors(itemProp.description.internalName, [...existingValidationErrors, "Bitte einen Wert eingeben"]);
              break;
            }
          }
        }
      }
    }
  });
  return listItemValue;
};
