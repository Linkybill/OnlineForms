import { IListViewManager } from "../interfaces/IListViewManager";
import { ListViewManager } from "../manager/ListViewManager";
import { SharePointListItemsProvider } from "../provider/SharePointListItemsProvider";

class Cache {
  static createdInstances: { [key: string]: IListViewManager } = {};
}

/**
 * Factory method to create ListViewManager instances configured by parameter values.
 *
 * @param webUrl The web URL to fetch list data from
 * @param listName The list name
 * @param viewName The name of list view to be used
 * @returns The configured ListViewManager instance
 */
export const createListViewManager: (webUrl: string, listName: string, viewName: string, webId?: string, lisId?: string) => IListViewManager = (
  webUrl: string,
  listName: string,
  viewName: string,
  webId?: string,
  listId?: string
): IListViewManager => {
  const key = webUrl + "_" + listName + "_" + viewName;
  if (Cache.createdInstances[key]) {
    return Cache.createdInstances[key];
  }
  const manager = new ListViewManager(new SharePointListItemsProvider(webUrl, listName, viewName, webId, listId));
  Cache.createdInstances[key] = manager;
  return manager;
};
