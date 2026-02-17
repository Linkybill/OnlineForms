import log from "loglevel";
import { IListViewManager } from "../interfaces/IListViewManager";
import { OrderByField } from "../models/OrderByField";
import { PagedResult } from "../models/PagedResult";
import { ListViewModel } from "../viewModels/ListViewModel";
import { ViewModel } from "../viewModels/ViewModel";
import { IListItemsProvider } from "../interfaces/IListItemsProvider";
import { Filter } from "../../../dynamicFilter/models/Filter";
import { FieldDescriptionTypes } from "../../../listItem/types/FieldDescriptionTypes";

export class ListViewManager implements IListViewManager {
  private readonly listItemsProvider: IListItemsProvider;
  public constructor(listItemsProvider: IListItemsProvider) {
    this.listItemsProvider = listItemsProvider;
  }
  public async deleteListItems(itemIdsToDelete: number[]): Promise<ViewModel<number[]>> {
    try {
      const deletePromises: Promise<number>[] = itemIdsToDelete.map((itemId) => {
        return this.listItemsProvider.deleteListItem(itemId);
      });
      const results = await Promise.all(deletePromises);
      return {
        error: undefined,
        model: results
      };
    } catch (e) {
      log.error("could not delete listItems with ids", itemIdsToDelete);
      return Promise.resolve<ViewModel<number[]>>({
        error: "could not delete list items, please check the log",
        model: []
      });
    }
  }

  async loadPage(pageRef?: string, filter?: Filter[], orderByFields?: OrderByField[], clearDefaultFilerFromView?: boolean, pageSize?: number): Promise<ViewModel<PagedResult>> {
    log.debug("trying to load list data with", {
      pageRef: pageRef,
      filter: filter,
      orderByFields: orderByFields
    });
    try {
      const data = await this.listItemsProvider.loadItems(pageRef, filter, orderByFields, clearDefaultFilerFromView, pageSize);
      return {
        error: undefined,
        model: data
      };
    } catch (e) {
      log.error("Could not load list data for pageRef, filter, orderByFields", pageRef, filter, orderByFields, e);
      return {
        error: "Liste konnte nicht geladen werden",
        model: {
          nextRef: undefined,
          result: [],
          columnWidthsGroupedByInternalName: {}
        }
      };
    }
  }
  public async initializeListWithFirstPage(shouldLoadViews: boolean, shouldLoadData: boolean): Promise<ViewModel<ListViewModel>> {
    try {
      const listDescription = this.listItemsProvider.getListDescription(true, shouldLoadViews);

      const firstPage: Promise<PagedResult> = shouldLoadData
        ? this.listItemsProvider.loadItems()
        : Promise.resolve<PagedResult>({
            nextRef: "",
            result: [],
            columnWidthsGroupedByInternalName: {}
          });
      const createOptions = await this.listItemsProvider.loadCreateOptions();
      const [resolvedListDescription, resolvedPage] = await Promise.all([listDescription, firstPage]);
      return {
        error: undefined,
        model: {
          listDescription: resolvedListDescription,
          loadedData: resolvedPage,
          createOptions: createOptions
        }
      };
    } catch (e) {
      log.error("could not initialize list", e);
      return Promise.resolve<ViewModel<ListViewModel>>({
        error: "Liste konnte nicht geladen werden",
        model: {
          createOptions: [],
          listDescription: {
            viewFieldDescriptions: [],
            listTitle: "",
            listId: "",
            views: [],
            defaultView: ""
          },
          loadedData: {
            nextRef: undefined,
            result: [],
            columnWidthsGroupedByInternalName: {}
          }
        }
      });
    }
  }
  public async getFilterProposals(field: FieldDescriptionTypes, filterValue: string, fieldDescriptions: FieldDescriptionTypes[]): Promise<ViewModel<PagedResult>> {
    try {
      let result = await this.listItemsProvider.getFilterData(field, filterValue, fieldDescriptions);

      return {
        error: undefined,
        model: result
      };
    } catch (e) {
      log.error("could not load filter proposals for field with filter: ", field, filterValue, e);
      return Promise.resolve<ViewModel<PagedResult>>({
        error: "Filtervorschläge konnten nicht geladen werden",
        model: {
          nextRef: undefined,
          result: [],
          columnWidthsGroupedByInternalName: {}
        }
      });
    }
  }
}
