import { CustomTemplatedListFieldDescription } from "../fields/customTemplatedListField/CustomTemplatedListFieldDescription";
import { DateTimeValue } from "../fields/dateTimeField/DateTimeValue";
import { ListFieldDescription } from "../fields/listField/ListFieldDescription";
import { FieldTypeNames } from "../FieldTypeNames";
import { createDefaultItem } from "../helper/ListHelper";
import { ListItem } from "../ListItem";
import { FieldDescriptionTypes } from "../types/FieldDescriptionTypes";
import { mapListItemToObject } from "./ListItemToObjectMapper";

export const mapObjectToListItem = (schema: FieldDescriptionTypes[], objectToMap: any): ListItem => {
  const listItem = createDefaultItem(schema, "", []);

  listItem.getProperties().forEach((props) => {
    switch (props.description.type) {
      case FieldTypeNames.DateTime:
        const dateValueToUse: DateTimeValue =
          objectToMap[props.description.internalName] === undefined || objectToMap[props.description.internalName] === null ? { date: undefined, time: undefined } : objectToMap[props.description.internalName];
        if (typeof dateValueToUse.date === "string") {
          dateValueToUse.date = new Date(dateValueToUse.date);
        }
        if (typeof dateValueToUse.time === "string") {
          dateValueToUse.time = new Date(dateValueToUse.time);
        }
        listItem.setValue(props.description.internalName, dateValueToUse);
        break;

      case FieldTypeNames.List:
        let fieldValueToSet = [];
        if (objectToMap[props.description.internalName] !== undefined && objectToMap[props.description.internalName] !== null) {
          const listDescription = props.description as ListFieldDescription;

          if (listDescription.itemProperties.length > 0) {
            objectToMap[props.description.internalName].forEach((objectItem) => {
              const mappedListItemFromObjectItem = mapObjectToListItem(listDescription.itemProperties, objectItem);
              fieldValueToSet.push(mapListItemToObject(mappedListItemFromObjectItem));
            });
          } else {
            fieldValueToSet = objectToMap[props.description.internalName];
          }
        }
        listItem.setValue(props.description.internalName, fieldValueToSet);
        break;
      case FieldTypeNames.CustomTemplatedEntity:
        let entityValueToSet = [];
        if (objectToMap[props.description.internalName] !== undefined && objectToMap[props.description.internalName] !== null) {
          const customTemplatedListFieldDescription = props.description as CustomTemplatedListFieldDescription;

          if (customTemplatedListFieldDescription.editorModel.customFieldDefinitions.length > 0) {
            objectToMap[props.description.internalName].forEach((objectItem) => {
              const mappedListItemFromObjectItem = mapObjectToListItem(customTemplatedListFieldDescription.editorModel.customFieldDefinitions, objectItem);
              entityValueToSet.push(mapListItemToObject(mappedListItemFromObjectItem));
            });
          } else {
            entityValueToSet = objectToMap[props.description.internalName];
          }
        }
        listItem.setValue(props.description.internalName, entityValueToSet);
        break;
      default:
        listItem.setValue(props.description.internalName, objectToMap[props.description.internalName]);
    }
  });
  listItem.ID = objectToMap.ID;
  listItem.Guid = objectToMap.Guid;
  return listItem;
};
