import { FieldTypeNames } from "../FieldTypeNames";
import { ListItem } from "../ListItem";

export const mapListItemToObject: <TReturnType>(item: ListItem) => TReturnType = <TReturnType>(item: ListItem): TReturnType => {
  const createdObject = {};
  createdObject["Guid"] = item.Guid;
  createdObject["ID"] = item.ID;
  item.getProperties().forEach((prop) => {
    if (prop.description.type === FieldTypeNames.Number && prop.value !== "") {
      const numberValue = +prop.value;
      if (!isNaN(numberValue)) {
        (createdObject as any)[prop.description.internalName] = numberValue;
      } else {
        (createdObject as any)[prop.description.internalName] = prop.value;
      }
    } else {
      (createdObject as any)[prop.description.internalName] = prop.value;
    }
  });

  return createdObject as TReturnType;
};
