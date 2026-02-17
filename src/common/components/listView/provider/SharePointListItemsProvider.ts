import { CamlHelper } from "../helper/CamlHelper";
import { IListItemsProvider } from "../interfaces/IListItemsProvider";
import { PagedResult } from "../models/PagedResult";
import { ListItem } from "../../../listItem/ListItem";
import { ListDescription } from "../models/ListDescription";
import { OrderByField } from "../models/OrderByField";
import log from "loglevel";
import { CreateOption } from "../models/CreateOption";
import { MapXmlSchemaToColumnWidth } from "../mapper/ColumnWdithMapper";
import { IViewInfo } from "@pnp/sp/views";
import { IList, RenderListDataOptions } from "@pnp/sp/lists";
import { FieldDescriptionTypes } from "../../../listItem/types/FieldDescriptionTypes";
import { Filter } from "../../../dynamicFilter/models/Filter";
import { sp } from "@pnp/sp";
import { RowToListItemMapper } from "../../../listItem/mapper/RowToListItemMapper";
import { IFieldInfo } from "@pnp/sp/fields";
import { FieldInfoToFieldDescriptionMapper } from "../../../listItem/mapper/FieldInfoToFieldDescriptionMapper";
import { IWeb, Web } from "@pnp/sp/webs";
import { FieldTypeNames } from "../../../listItem/FieldTypeNames";

class Cache {
  static shemaCache: { [key: string]: FieldDescriptionTypes[] } = {};
  static listFields: { [key: string]: IFieldInfo[] } = {};
}

export class SharePointListItemsProvider implements IListItemsProvider {
  /**
   * API URL to get meta information about a list
   */
  private webUrl: string;

  private listFieldsKeyForCache: string;

  // Id of the web, where the list is located. If undefined, webUrl will be used.
  private webId?: string;
  /**
   * The list title to be used for api requests
   */
  private listName: string;

  // listId which should get used. If undefined, listName will be used.
  private listId?: string;

  /**
   * The view name to be used for api requests
   */
  private viewName: string;

  private currentView: IViewInfo | undefined;
  private ensuredListInstance: IList | undefined;

  /**
   * Titles of non-indexed columns contained in this list
   */
  private notIndexedColumnNames: string[] = [];

  /**
   * Titles of multi-lookup columns contained in this list
   */

  private notIndexedColumnsGotInitialized: boolean = false;

  /**
   * The constructor. Sets variables and fetch list information from SP API-
   *
   * @param webUrl The API web URL.
   * @param listName The name/title of list to fetch information from.
   * @param viewName Name of view of list
   */
  public constructor(webUrl: string, listName: string, viewName: string, webId?: string, listId?: string) {
    this.webUrl = webUrl;
    this.listName = listName;
    this.viewName = viewName;
    this.listId = listId;
    this.webId = webId;
    this.listFieldsKeyForCache = "" + webUrl + "_" + listName;

    log.trace("Instanciated sharePointListItemsProvider with", {
      webUrl: this.webUrl,
      webId: this.webId,
      listName: this.listName,
      listId: this.listId,
      viewName: this.viewName
    });
  }
  public async loadListItem(itemId: number): Promise<ListItem> {
    var filter: Filter[] = [{ fieldName: "ID", fieldType: FieldTypeNames.Number, values: [itemId.toString()] }];
    const pageResult = await this.loadItems(undefined, filter);
    if (pageResult.result.length == 0) {
      throw new Error("listItem wurde nicht gefunden, in webUrl, ListName, ItemId" + this.webUrl + " " + this.listName + " " + itemId);
    }

    return pageResult.result[0];
  }

  public async deleteListItem(itemId: number): Promise<number> {
    const list = await this.getEnsuredCurrentList();
    await list.items.getById(itemId).delete();
    return Promise.resolve<number>(itemId);
  }

  public loadViews: () => Promise<string[]> = async (): Promise<string[]> => {
    log.debug("going to load views");
    const currentList = await this.getEnsuredCurrentList();
    const views = await currentList.views.get();
    log.debug("loaded views", views);
    return views.map((view) => view.Title);
  };

  /**
   *
   * @param field
   * @param filterValue
   * @returns
   */
  public async getFilterData(field: FieldDescriptionTypes, filterValue: string, fieldDescriptions: FieldDescriptionTypes[]): Promise<PagedResult> {
    log.debug("going to load filter data from sharePoint", field, filterValue);

    const currentView = await this.ensureViewInfo();
    const viewWithFilter = CamlHelper.addContainsClauseToView(currentView.ListViewXml, field.internalName, filterValue, field.type);

    const items = await this.loadItemsFromXmlView(viewWithFilter, fieldDescriptions);
    log.debug("loaded filter data from sharePoint", items);

    return items;
  }

  public async getListDescription(includeSchema: boolean, includeViews: boolean): Promise<ListDescription> {
    if (!includeViews && !includeSchema) {
      throw new Error("at least one flag of includeSchema, includeViews should be set to true");
    }
    log.debug("going to load list description");
    const currentList = await this.getEnsuredCurrentList();
    const currentListInfo = await currentList.get();

    let currentShema: Promise<FieldDescriptionTypes[]> = Promise.resolve([]);

    if (includeSchema) {
      currentShema = this.loadListSchema();
    }

    // get list id:

    const listId = currentListInfo.Id;
    log.debug("loaded listProxy", currentList);
    const defaultView: IViewInfo = await currentList.defaultView.get();

    let views: Promise<string[]> = Promise.resolve<string[]>([]);
    if (includeViews) {
      views = this.loadViews();
    }

    const [resolvedSchema, resolvedViews] = await Promise.all([currentShema, views]);
    log.debug("loaded lookupInfos for list", {
      listName: currentListInfo.Title,
      listId: listId,
      defaultView: defaultView.Title
    });
    const result: ListDescription = {
      listTitle: this.listName,
      viewFieldDescriptions: resolvedSchema,
      listId: listId,
      views: resolvedViews,
      defaultView: defaultView.Title
    };
    log.debug("loaded description for list with webUrl: " + this.webUrl, this.listName, this.viewName, result);
    return result;
  }

  public async loadItems(nextRef?: string, filter: Filter[] = [], sorting: OrderByField[] = [], clearDefaultFiltersFromView?: boolean, pageSize?: number): Promise<PagedResult> {
    log.debug("going to load items from sharePoint");
    const currentList = await this.getEnsuredCurrentList();
    // in case page is not applied to the selected view
    let xml = (await this.ensureViewInfo()).ListViewXml;
    xml = CamlHelper.modifyViewWithFilterAndSorting(xml, filter, sorting, clearDefaultFiltersFromView);

    const queryParameter = new Map<string, string>();

    let viewId: string | undefined = this.currentView?.Id;

    this.appendPagingParametersToQuery(queryParameter, nextRef);
    this.appendSortingParameterToQuery(queryParameter, sorting);

    if (filter.length !== 0) {
      viewId = "";
    }

    queryParameter.set("View", viewId ? viewId : "");

    // when not indexed columns are involved in filter, then the query needs to be passed as override parameter, otherwhise it canbe passed as view

    let queryStringFromView = "<Query/>";
    if (xml.indexOf("<Query>") >= 0) {
      queryStringFromView = xml.substring(xml.indexOf("<Query>"), xml.indexOf("</Query>") + 8);
    }

    const specialColumns = await this.ensureNotIndexedFieldNames();
    const notIndexedColumnsAreInvolvedInFilter = filter.filter((filter) => specialColumns.notIndexedColumnNames.indexOf(filter.fieldName) >= 0).length > 0;

    let viewXml: string | undefined = xml;
    let overrideViewXml: string | undefined = undefined;
    const resolvedList = await currentList.get();
    const contentTypes = await currentList.contentTypes.get();
    const folders = contentTypes.filter((ct) => ct.Id.StringValue.startsWith("0x0120"));
    const hasFolders = folders.length > 0;
    if (hasFolders == true && resolvedList.ContentTypesEnabled) {
      viewXml = CamlHelper.ensureViewToBeRecursive(xml);
    }
    viewXml = await CamlHelper.ensureAllFieldsInViewFromSharePoint(viewXml, currentList);
    if (notIndexedColumnsAreInvolvedInFilter) {
      log.debug("not indexed columns are involved in filter, therfore using overrideViewXml", queryStringFromView);
      viewXml = hasFolders ? viewXml : undefined; // is undefined when folders exists, because in view there is recursive parameter set which does not come with when this is set to undefined. That means, that libs and lists with folders may have issues with item threasholds
      overrideViewXml = queryStringFromView;
    }

    if (filter.length === 0 && pageSize === undefined) {
      viewXml = undefined;
    }

    if (viewXml !== undefined && pageSize !== undefined) {
      viewXml = CamlHelper.ensureRowLimitInCaml(viewXml, pageSize);
    }

    if (overrideViewXml !== undefined && pageSize !== undefined) {
      overrideViewXml = CamlHelper.ensureRowLimitInCaml(overrideViewXml, pageSize);
    }

    const result: {
      ListData: { [key: string]: Object };
    } = (await currentList.renderListDataAsStream(
      {
        ViewXml: viewXml,
        OverrideViewXml: overrideViewXml,
        DatesInUtc: true,
        RenderOptions: [RenderListDataOptions.ContextInfo, RenderListDataOptions.ListData, RenderListDataOptions.ListSchema]
      },
      undefined,
      queryParameter
    )) as any;
    log.debug("loaded items from provider", result);
    let nextHref: string | undefined = undefined;
    if (result.ListData.NextHref !== undefined) {
      const splittedResult = (result.ListData.NextHref as string).split("?");
      if (splittedResult.length > 1) {
        nextHref = splittedResult[1];
      }
    }

    const rowsToMap: any[] = result.ListData.Row as any[];
    const allFields = (result as any).ListSchema.Field.map((f) => (f.StaticName != undefined ? f.StaticName : f.Name));
    const schema = await this.loadListSchemaBasedOnAllFields(allFields);
    const mappedItems = RowToListItemMapper.mapRowToListItems(rowsToMap, schema);

    let columnWidthInfos: { [fieldName: string]: number } = {};
    if ((result as any).ListSchema?.ColumnWidth !== undefined && (result as any).ListSchema?.ColumnWidth !== "") {
      columnWidthInfos = await MapXmlSchemaToColumnWidth((result as any).ListSchema.ColumnWidth);
    }

    return {
      result: mappedItems,
      nextRef: nextHref,
      columnWidthsGroupedByInternalName: columnWidthInfos
    };
  }

  /**
   * Creates an array of CreateOptions array
   *
   * @returns a Promise of CreateOptions Array
   * @todo Check if we need the second fields fetching SP API call
   */
  async loadCreateOptions(): Promise<CreateOption[]> {
    log.debug("Going to load create menu...", this.webUrl, this.listName);

    const currentList = await this.getEnsuredCurrentList();
    const contentTypes = await currentList.contentTypes.get();

    const result = contentTypes.map((contentType): CreateOption => {
      return {
        contentTypeId: contentType.Id.StringValue,
        listName: this.listName,
        webUrl: this.webUrl,
        title: contentType.Name
      };
    });

    log.debug("... create menu loaded.", result);

    return result;
  }

  private appendSortingParameterToQuery(queryParameter: Map<string, string>, sorting: OrderByField[]) {
    if (sorting.length !== 0) {
      const sortField = sorting[0].fieldName;
      const direction = sorting[0].ascending ? "Asc" : "Desc";
      queryParameter.set("SortField", sortField);
      queryParameter.set("SortDir", direction);
    }
  }

  private appendPagingParametersToQuery(queryParameter: Map<string, string>, page: string | undefined) {
    if (page !== undefined) {
      const nextRefParameterSplits = page.split("&");
      nextRefParameterSplits.forEach((variableWithEquals) => {
        const splittedVariable = variableWithEquals.split("=");
        if (splittedVariable.length === 2 && splittedVariable[0] !== "View") {
          queryParameter.set(splittedVariable[0], splittedVariable[1]);
        }
      });
    }
  }

  private async ensureNotIndexedFieldNames(): Promise<{
    notIndexedColumnNames: string[];
  }> {
    if (!this.notIndexedColumnsGotInitialized) {
      const currentList = await this.getEnsuredCurrentList();

      const currentView = await this.ensureViewInfo();
      const listFields = Cache.listFields[this.listFieldsKeyForCache] !== undefined ? Cache.listFields[this.listFieldsKeyForCache] : await currentList.fields.get();
      Cache.listFields[this.listFieldsKeyForCache] = listFields;
      listFields.forEach((column) => {
        const columnIsInView = currentView.ListViewXml.indexOf('"' + column.StaticName + '"') > 0;
        if (columnIsInView) {
          if (!column.Indexed) {
            this.notIndexedColumnNames.push(column.StaticName);
          }
        }
      });
      this.notIndexedColumnsGotInitialized = true;
    }

    return {
      notIndexedColumnNames: this.notIndexedColumnNames
    };
  }

  /**
   * Ensures the currentView variable is set (set it, if not).
   *
   * @returns Current view object of this list
   */
  private async ensureViewInfo(): Promise<IViewInfo | PromiseLike<IViewInfo>> {
    if (this.currentView !== undefined) {
      return this.currentView;
    }
    const currentList = await this.getEnsuredCurrentList();

    const views = await currentList.views();
    const filteredViews = views?.filter((view: IViewInfo, index: number) => view.Title === this.viewName);

    if (filteredViews !== undefined && filteredViews.length !== 1) {
      throw new Error("invalid view name " + this.viewName);
    }

    this.currentView = filteredViews ? filteredViews[0] : undefined;

    if (this.currentView === undefined) {
      throw new Error("listview: requested view can not be found");
    }

    return this.currentView;
  }

  private async loadItemsFromXmlView(viewWithFilter: string, fieldDescriptions: FieldDescriptionTypes[]): Promise<PagedResult> {
    const currentList = await this.getEnsuredCurrentList();
    let result: any | undefined;

    result = await currentList.renderListDataAsStream(
      {
        ViewXml: viewWithFilter,
        DatesInUtc: true
      },
      undefined
    );

    log.debug("filterpanell, loaded proposals in provider", result);

    const mappedItems = RowToListItemMapper.mapRowToListItems(result.Row, fieldDescriptions);

    return {
      nextRef: result?.NextHref,
      result: mappedItems,
      columnWidthsGroupedByInternalName: {}
    };
  }

  private mapToOrderedFields(sharepointFields: IFieldInfo[], orderedViewFieldNames: string[]): FieldDescriptionTypes[] {
    const orderedFields: IFieldInfo[] = [];

    orderedViewFieldNames.forEach((fieldName): void => {
      log.debug("mapToOrderedField " + fieldName);
      const field = sharepointFields.filter((spField) => spField.InternalName === fieldName)[0];
      if (field === undefined) {
        log.error("field not found: ", fieldName);
      }
      if (!field.Hidden) {
        orderedFields.push(field);
      }
    });
    return orderedFields.map((field) => FieldInfoToFieldDescriptionMapper.mapFieldInfoToFieldDescription(field));
  }

  /**
   * Fetch list by name/title from
   *
   * @returns
   */
  private getListByTitDemorByWebAndListId(): IList {
    const web = this.generateWebClient(this.webUrl);
    return web.lists.getByTitle(this.listName);
  }

  /**
   * Generates a PnP web client to be used to fetch data from sharepoint.
   *
   * @param apiUrl The SP API URL to query data.
   * @returns The PnP web client.
   */
  private generateWebClient(apiUrl: string): IWeb {
    return Web(apiUrl) as IWeb;
  }

  private async getEnsuredCurrentList(): Promise<IList> {
    if (this.ensuredListInstance === undefined) {
      if (this.listId !== undefined && this.webId !== undefined) {
        const web = await sp.site.openWebById(this.webId);
        this.ensuredListInstance = web.web.lists.getById(this.listId);
        return this.ensuredListInstance;
      }
      this.ensuredListInstance = this.getListByTitDemorByWebAndListId();
    }
    return this.ensuredListInstance;
  }

  private async loadListSchema(): Promise<FieldDescriptionTypes[]> {
    const key = this.webUrl + "_" + this.listName + "_" + this.viewName;
    if (Cache.shemaCache[key] !== undefined) {
      return Promise.resolve(Cache.shemaCache[key]);
    }

    const currentList = await this.getEnsuredCurrentList();
    let viewShema = await currentList.views.getByTitle(this.viewName).fields.get();
    viewShema.SchemaXml = await CamlHelper.ensureAllFieldsInViewFromSharePoint(viewShema.SchemaXml, currentList);
    log.debug("loaded view schema...", viewShema, (viewShema as any).Items);

    // items comes with the request from sharepoint but is not in model of pnp

    let viewFieldNames: string[] = (viewShema as any).Items;
    const viewFieldNameMappings: { [originalName: string]: string } = {};
    viewFieldNameMappings["LinkTitle"] = "Title";
    viewFieldNameMappings["LinkTitleNoMenu"] = "Title";

    viewFieldNames = viewFieldNames.map((fieldName) => (viewFieldNameMappings[fieldName] !== undefined ? viewFieldNameMappings[fieldName] : fieldName));

    const listFields = Cache.listFields[this.listFieldsKeyForCache] !== undefined ? Cache.listFields[this.listFieldsKeyForCache] : await currentList.fields.get();
    Cache.listFields[this.listFieldsKeyForCache] = listFields;

    log.debug("loaded fields", listFields);

    // fieldsByPositionInViewSchema and foundPositions is used to return the correct order of the view fields.
    const orderedFields: FieldDescriptionTypes[] = this.mapToOrderedFields(listFields ? listFields : [], viewFieldNames);
    Cache.shemaCache[key] = orderedFields;
    return Promise.resolve(orderedFields);
  }

  private async loadListSchemaBasedOnAllFields(allFieldNames: string[]): Promise<FieldDescriptionTypes[]> {
    const key = this.webUrl + "_" + this.listName + "_" + this.viewName;
    if (Cache.shemaCache[key] !== undefined) {
      return Promise.resolve(Cache.shemaCache[key]);
    }

    const currentList = await this.getEnsuredCurrentList();
    const viewFieldNameMappings: { [originalName: string]: string } = {};
    viewFieldNameMappings["LinkTitle"] = "Title";
    viewFieldNameMappings["LinkTitleNoMenu"] = "Title";

    allFieldNames = allFieldNames.map((fieldName) => (viewFieldNameMappings[fieldName] !== undefined ? viewFieldNameMappings[fieldName] : fieldName));

    const listFields = Cache.listFields[this.listFieldsKeyForCache] !== undefined ? Cache.listFields[this.listFieldsKeyForCache] : await currentList.fields.get();
    Cache.listFields[this.listFieldsKeyForCache] = listFields;

    log.debug("loaded fields", listFields);

    // fieldsByPositionInViewSchema and foundPositions is used to return the correct order of the view fields.
    const orderedFields: FieldDescriptionTypes[] = this.mapToOrderedFields(listFields ? listFields : [], allFieldNames);
    Cache.shemaCache[key] = orderedFields;
    return Promise.resolve(orderedFields);
  }
}
