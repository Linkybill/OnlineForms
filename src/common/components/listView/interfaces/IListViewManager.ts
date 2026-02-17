import { Filter } from "../../../dynamicFilter/models/Filter";
import { FieldDescriptionTypes } from "../../../listItem/types/FieldDescriptionTypes";
import { OrderByField } from "../models/OrderByField";
import { PagedResult } from "../models/PagedResult";
import { ListViewModel } from "../viewModels/ListViewModel";
import { ViewModel } from "../viewModels/ViewModel";

export interface IListViewManager {
  deleteListItems(itemIdsToDelete: number[]): Promise<ViewModel<number[]>>;
  loadPage(pageRef?: string, filter?: Filter[], orderByFields?: OrderByField[], clearDefaultFiltersInView?: boolean, pageSize?: number): Promise<ViewModel<PagedResult>>;
  initializeListWithFirstPage(shouldLoadViewsForViewSelector: boolean, shouldLoadData: boolean): Promise<ViewModel<ListViewModel>>;
  getFilterProposals(field: FieldDescriptionTypes, filterValue: string, fieldDescriptions: FieldDescriptionTypes[]): Promise<ViewModel<PagedResult>>;
}
