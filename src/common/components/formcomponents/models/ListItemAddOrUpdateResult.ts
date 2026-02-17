import { ListItem } from "../../../listItem/ListItem";

export interface ListItemAddOrUpdateResult {
  listItem: ListItem;
  errorsGroupedByInternalFieldName: { [internalName: string]: string };
}
