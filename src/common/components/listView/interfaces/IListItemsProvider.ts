import { Filter } from "../../../dynamicFilter/models/Filter";
import { FieldDescriptionTypes } from "../../../listItem/types/FieldDescriptionTypes";
import { CreateOption } from "../models/CreateOption";
import { ListDescription } from "../models/ListDescription";
import { OrderByField } from "../models/OrderByField";
import { PagedResult } from "../models/PagedResult";

export interface IListItemsProvider {
  deleteListItem(itemId: number): Promise<number>;
  loadListItem(itemId: number): Promise<ListItem>;
  loadItems(nextRef?: string, filter?: Filter[], orderByFields?: OrderByField[], clearDefaultFilterFromView?: boolean, pageSize?: number): Promise<PagedResult>;
  getListDescription(includeSchema: boolean, includeViews: boolean): Promise<ListDescription>;
  getFilterData(field: FieldDescriptionTypes, filterValue: string, fieldDescriptions: FieldDescriptionTypes[]): Promise<PagedResult>;
  loadCreateOptions(): Promise<CreateOption[]>;
  loadViews(): Promise<string[]>;
}
