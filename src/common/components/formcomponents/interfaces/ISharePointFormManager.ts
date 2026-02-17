import { ListItem } from "../../../listItem/ListItem";
import { ListItemDefaultValue } from "../../../listItem/types/ListItemDefaultValue";
import { ErrorViewModel } from "../../../models/ErrorViewModel";
import { SharePointFormResult } from "../viewModels/SharePointFormResult";

export interface ISharePointFormManager {
  addOrUpdateItem(webId: string, listId: string, listItemIdToDisplay: number | undefined, listItem: ListItem): Promise<ErrorViewModel<ListItem>>;
  loadForm(
    webId: string,
    listId: string,
    listItemIdToDisplay: number | undefined,
    contentTypeId: string | undefined,
    renderAsTextOnly: boolean,
    formDefaultValues: ListItemDefaultValue[]
  ): Promise<ErrorViewModel<SharePointFormResult>>;
}
