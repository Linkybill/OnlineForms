import { mapListItemToObject } from "../listItem/mapper/ListItemToObjectMapper";
import { ListItem } from "../listItem/ListItem";
export const updateObjectAtPath = (objectToUpdate: any, path: string[], value: any): any => {
  let o = objectToUpdate;
  for (var i = 0; i < path.length; i++) {
    if (i < path.length - 1) {
      o = o[path[i]];
    } else {
      o[path[i]] = value;
    }
  }
  return JSON.parse(JSON.stringify(objectToUpdate));
};

export const createDataForJsonLogic = (listItem: ListItem, datasources: any): any => {
  const listItemData = mapListItemToObject(listItem) as any;

  return { listItem: { ...listItemData }, datasources: { ...datasources } };
};

export const getValueFromPath = (object: any, path: string[]): any => {
  let valToReturn = object;
  for (var i = path[0] === "" ? 1 : 0; i < path.length; i++) {
    if (valToReturn === null || valToReturn === undefined) {
      return valToReturn;
    }
    valToReturn = valToReturn[path[i]];
  }
  return valToReturn;
};
