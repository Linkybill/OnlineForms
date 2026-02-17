import { sp } from "@pnp/sp";
import log from "loglevel";
import { SPHttpClient } from "@microsoft/sp-http";
import { ListItem } from "../../../listItem/ListItem";
import { FieldDescription } from "../../../listItem/fields/base/FieldDescription";
import { loadFieldSchema } from "../../../listItem/helper/ListHelper";
import { RowToListItemMapper } from "../../../listItem/mapper/RowToListItemMapper";
import { FieldValueTypes } from "../../../listItem/types/FieldValueTypes";
import { IListItemProvider } from "../interfaces/IListItemProvider";
import { ListItemToListItemFormUpdateValuesMapper } from "../mapper/ListItemToListItemFormUpdateValuesMapper";

export class SharePointListItemProvider implements IListItemProvider {
  spHttpClient: SPHttpClient;
  constructor(spHttpClient: SPHttpClient) {
    this.spHttpClient = spHttpClient;
  }
  public async deleteListItem(listId: string, itemId: number, webId?: string): Promise<number> {
    const requestedWebId = webId !== undefined ? webId : (await sp.web.get()).Id;
    const web = await sp.site.openWebById(requestedWebId);
    await web.web.lists.getById(listId).items.getById(itemId).delete();
    return Promise.resolve(itemId);
  }
  public async loadListItem(listId: string, itemId: number, webId?: string, loadAllListFieldsInsteadOfContentTypeFielsOnly?: boolean): Promise<ListItem | undefined> {
    if (loadAllListFieldsInsteadOfContentTypeFielsOnly === undefined) {
      loadAllListFieldsInsteadOfContentTypeFielsOnly = false;
    }
    const requestedWebId = webId !== undefined ? webId : (await sp.web.get()).Id;
    const web = await sp.site.openWebById(requestedWebId);
    log.debug("going to load list item with id ", itemId, {
      id: itemId,
      listId: listId,
      webId: webId
    });
    const list = web.web.lists.getById(listId);
    const contentTypeInfo = await list.items.getById(itemId).contentType.get();
    const contentTypeId = contentTypeInfo.Id;

    log.debug("item has contenttype id", contentTypeId);

    const fieldSchema = await loadFieldSchema(requestedWebId, listId, loadAllListFieldsInsteadOfContentTypeFielsOnly ? undefined : contentTypeInfo.Id.StringValue);
    log.debug("loadedContentTypeFields: ", fieldSchema);

    const body = {};

    var fieldOptions = {
      headers: { Accept: "application/json;odata.metadata=none" },
      body: JSON.stringify(body)
    };

    let response = await this.spHttpClient.post(list.toUrl() + "/RenderExtendedListFormData(itemId=" + itemId + ",formId='editform',mode='2',options=30,cutoffVersion=0)", SPHttpClient.configurations.v1, fieldOptions);

    const data = await response.json();
    const dataToUse = JSON.parse(data.value);

    log.debug("loaded listitem data... going to return listItem ", {
      renderExtendedFormResult: JSON.parse(data.value)
    });

    const listItem = RowToListItemMapper.mapRowToListItems(dataToUse.Data.Row, fieldSchema);

    log.debug("mapped to listitem", listItem);

    return listItem[0];
  }

  public async updateItem(listItem: ListItem, webId: string, listId: string, itemId: number): Promise<ListItem> {
    log.debug("going to update listitem");
    const web = await sp.site.openWebById(webId);
    const values = ListItemToListItemFormUpdateValuesMapper.mapListItemToToFormUpdateValues(listItem, true);
    const result = await web.web.lists.getById(listId).items.getById(itemId).validateUpdateListItem(values);

    log.debug("tried to update listitem", result);

    result.forEach((prop) => {
      listItem.setErrors(prop.FieldName as string, prop.ErrorMessage !== undefined && prop.ErrorMessage !== null && prop.ErrorMessage !== "" ? [prop.ErrorMessage] : []);
      log.debug("setting exception in listitem", prop, listItem);
    });
    return listItem;
  }

  public async addItem(listItem: ListItem, webId: string, listId: string): Promise<ListItem> {
    log.debug("going to add listitem");

    const web = await sp.site.openWebById(webId);
    const values = ListItemToListItemFormUpdateValuesMapper.mapListItemToToFormUpdateValues(listItem, false);

    values.push({
      FieldName: "ContentTypeId",
      FieldValue: listItem.ContentTypeId
    });

    const result = await web.web.lists.getById(listId).addValidateUpdateItemUsingPath(values, "");

    let itemHasErrors: boolean = false;
    log.debug("tried to add listitem!!!", result);
    result.forEach((prop) => {
      listItem.setErrors(prop.FieldName as string, prop.ErrorMessage !== null ? [prop.ErrorMessage] : []);
      if (prop.ErrorMessage !== null) {
        itemHasErrors = true;
      }
    });

    log.debug("checking for id prop!!!");
    const idProp = result.find((prop) => prop.FieldName === "Id");
    log.debug("found id prop", idProp);
    if (idProp !== undefined && !itemHasErrors) {
      listItem.ID = Number.parseInt(idProp.FieldValue ? idProp.FieldValue : "-1");
    }
    log.debug("added listitem", listItem);
    return listItem;
  }

  public async loadFieldSchema(webId: string, listId: string, contentTypeId: string): Promise<FieldDescription<FieldValueTypes>[]> {
    return loadFieldSchema(webId, listId, contentTypeId);
  }
}
