import { ListItem } from "../../../listItem/ListItem";
import { FieldDescription } from "../../../listItem/fields/base/FieldDescription";
import { FieldValueTypes } from "../../../listItem/types/FieldValueTypes";

export interface IListItemProvider {
  loadFieldSchema(webId: string, listId: string, contentTypeId: string): Promise<FieldDescription<FieldValueTypes>[]>;
  loadListItem(listId: string, itemId: number, webId?: string): Promise<ListItem | undefined>;

  updateItem(itemToUpdate: ListItem, webId: string, listId: string, itemId: number): Promise<ListItem>;
  addItem(itemToAdd: ListItem, webId: string, listId: string): Promise<ListItem>;
}
