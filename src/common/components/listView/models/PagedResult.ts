import { ListItem } from "../../../listItem/ListItem";

export interface PagedResult {
  result: ListItem[];
  nextRef: string | undefined;
  columnWidthsGroupedByInternalName: { [columnName: string]: number };
}
