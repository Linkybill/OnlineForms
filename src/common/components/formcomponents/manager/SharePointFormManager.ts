import log from "loglevel";
import { ListItem } from "../../../listItem/ListItem";
import { createDefaultItem } from "../../../listItem/helper/ListHelper";
import { FieldDescriptionTypes } from "../../../listItem/types/FieldDescriptionTypes";
import { ListItemDefaultValue } from "../../../listItem/types/ListItemDefaultValue";
import { ErrorViewModel } from "../../../models/ErrorViewModel";
import { IListItemProvider } from "../interfaces/IListItemProvider";
import { ISharePointFormManager } from "../interfaces/ISharePointFormManager";
import { SharePointFormResult } from "../viewModels/SharePointFormResult";

export class SharePointFormManager implements ISharePointFormManager {
  private provider: IListItemProvider;
  public constructor(provider: IListItemProvider) {
    this.provider = provider;
  }
  public async addOrUpdateItem(webId: string, listId: string, listItemIdToDisplay: number | undefined, listItem: ListItem): Promise<ErrorViewModel<ListItem>> {
    try {
      if (listItemIdToDisplay !== undefined) {
        const result = await this.provider.updateItem(listItem, webId, listId, listItemIdToDisplay ? listItemIdToDisplay : -1);
        return {
          error: undefined,
          model: result
        };
      } else {
        const result = await this.provider.addItem(listItem, webId, listId);
        return {
          error: undefined,
          model: result
        };
      }
    } catch (e) {
      log.error("sharepoint formmanager: could not add or update listitem,", {
        listItem: listItem,
        webId: webId,
        listId: listId,
        error: e
      });
      return {
        error: "could not add or update item",
        model: listItem
      };
    }
  }
  async loadForm(
    webId: string,
    listId: string,
    listItemIdToDisplay: number | undefined,
    contentTypeId: string,
    renderAsTextOnly: boolean,
    formDefaultValues: ListItemDefaultValue[]
  ): Promise<ErrorViewModel<SharePointFormResult>> {
    try {
      log.debug("loading form data with listName, listItemIdToDisplay, contentTypeId", {
        webId: webId,
        listId: listId,
        listItemIdToDisplay: listItemIdToDisplay,
        contentTypeId: contentTypeId
      });

      if ((contentTypeId === undefined || contentTypeId === "") && listItemIdToDisplay === undefined) {
        log.warn("SharePointFormManager loadForm got called with contenttype id = undefined and listItemId = undefined. one of the arguments must be set.");
        return Promise.resolve<ErrorViewModel<SharePointFormResult>>({
          error: "Could not load form, please check the log",
          model: {
            formData: undefined,
            formFields: []
          }
        });
      } else {
        if (listItemIdToDisplay !== undefined) {
          const item = await this.provider.loadListItem(listId, listItemIdToDisplay, webId);
          log.debug("SharePointFormManager: loaded listitem", item);
          if (item === undefined) {
            return Promise.resolve<ErrorViewModel<SharePointFormResult>>({
              error: "Das angefragte Element wurde nicht gefunden",
              model: {
                formData: new ListItem(undefined),
                formFields: []
              }
            });
          }

          return {
            error: undefined,
            model: {
              formData: item,
              formFields: item.requestedFieldSchema
            }
          };
        }

        // in this case a default item needs to be returned
        if (listItemIdToDisplay === undefined && contentTypeId !== undefined) {
          const schema = await this.provider.loadFieldSchema(webId, listId, contentTypeId);

          const item: ListItem = createDefaultItem(schema as FieldDescriptionTypes[], contentTypeId, formDefaultValues);
          return {
            error: undefined,
            model: {
              formData: item,
              formFields: item.requestedFieldSchema
            }
          };
        }
      }

      return Promise.resolve<ErrorViewModel<SharePointFormResult>>({
        error: "unexpected error ....?",
        model: {
          formData: new ListItem(undefined),
          formFields: []
        }
      });
    } catch (e) {
      log.error(e);
      return Promise.resolve<ErrorViewModel<SharePointFormResult>>({
        error: "unexpected error",
        model: {
          formData: new ListItem(undefined),
          formFields: []
        }
      });
    }
  }
}
