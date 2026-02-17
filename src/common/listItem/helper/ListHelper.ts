import { sp } from "@pnp/sp";
import log from "loglevel";
import { ListItem } from "../ListItem";
import { FieldInfoToFieldDescriptionMapper } from "../mapper/FieldInfoToFieldDescriptionMapper";
import { RowToListItemMapper } from "../mapper/RowToListItemMapper";
import { FieldDescriptionTypes } from "../types/FieldDescriptionTypes";
import { ListItemDefaultValue } from "../types/ListItemDefaultValue";
import { IFieldInfo } from "@pnp/sp/fields";
import { getIWebObjectForServerRelativeUrl } from "../../helper/SPHelper";

class Cache {
  static schemaCache: { [key: string]: FieldDescriptionTypes[] } = {};
}

export const createDefaultItem = (schema: FieldDescriptionTypes[], contentTypeId: string, injectedDefaultValues: ListItemDefaultValue[]): ListItem => {
  log.debug("createDefaultItem: creating default item for", {
    schema: schema,
    contentTypeId: contentTypeId
  });
  return RowToListItemMapper.mapFieldDescriptionsToDefaultListItem(schema, contentTypeId, injectedDefaultValues);
};

export const loadFieldSchemaByServerRelativeUrl = async (serverRelativeWebUrl: string, listName: string): Promise<FieldDescriptionTypes[]> => {
  const key = "loadFieldSchemaByServerRelativeUrl_" + serverRelativeWebUrl + "_" + listName;
  if (Cache.schemaCache[key] !== undefined) {
    return Promise.resolve(Cache.schemaCache[key]);
  }
  const webObject = await getIWebObjectForServerRelativeUrl(serverRelativeWebUrl);
  const list = webObject.lists.getByTitle(listName);
  const fields = await list.fields.get();
  const notHiddenFields = fields.filter((f) => {
    return (f as IFieldInfo).Hidden !== true;
  });
  const mappedDescriptions = notHiddenFields.map((fieldInfo) => FieldInfoToFieldDescriptionMapper.mapFieldInfoToFieldDescription(fieldInfo));

  const result = mappedDescriptions.filter((description) => description.internalName !== "ContentType");
  Cache.schemaCache[key] = result;

  return result;
};
export const loadFieldSchema = async (webId: string, listId: string, contentTypeId: string | undefined): Promise<FieldDescriptionTypes[]> => {
  const key = webId + "_" + listId + "_" + contentTypeId === undefined ? "" : contentTypeId;
  if (Cache.schemaCache[key] !== undefined) {
    return Promise.resolve(Cache.schemaCache[key]);
  }
  const web = await sp.site.openWebById(webId);
  let fields = [];
  if (contentTypeId !== undefined) {
    fields = await web.web.lists.getById(listId).contentTypes.getById(contentTypeId).fields.get();
  } else {
    fields = await web.web.lists.getById(listId).fields.get();
  }

  const notHiddenFields = fields.filter((f) => {
    return (f as IFieldInfo).Hidden !== true;
  });
  const mappedDescriptions = notHiddenFields.map((fieldInfo) => FieldInfoToFieldDescriptionMapper.mapFieldInfoToFieldDescription(fieldInfo));

  const result = mappedDescriptions.filter((description) => description.internalName !== "ContentType");
  Cache.schemaCache[key] = result;

  return result;
};
