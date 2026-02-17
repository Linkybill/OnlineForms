import { SPHttpClient, HttpClient } from "@microsoft/sp-http";
import { DataSourceDefinition } from "../models/datasources/DataSourceDefinition";
import { DatasourceTypeNames } from "../models/datasources/DataSourceTypes";
import { DatasourceTriggerConfig } from "../models/datasources/DatasourceTriggerConfig";
import { SwaggerDatasourceConfig } from "../models/datasources/SwaggerDatasourceConfig";
import log from "loglevel";
import { SharePointDatasourceConfig } from "../models/datasources/SharePointDatasourceConfig";
import { createListViewManager } from "../../components/listView/helper/CreateListViewManager";
import { Filter } from "../../dynamicFilter/models/Filter";
import { ParameterMapping } from "../models/datasources/ParameterMapping";
import { getValueFromPath } from "../../helper/ObjectByPathHelper";
import { getSharePointDatasourceWeb } from "../helper/DatasourceHelper";
import axios from "axios";
import { IViewInfo } from "@pnp/sp/views";
import { IWeb, IWebInfo } from "@pnp/sp/webs";
import { IListInfo } from "@pnp/sp/lists";
import { KnownSwaggerDatasource } from "../models/datasources/KnownSwaggerDatasource";

class Cache {
  static viewCache: { [key: string]: IViewInfo } = {};
  static iwebCache: { [key: string]: IWeb } = {};
  static iWebInfoCache: { [key: string]: IWebInfo } = {};
  static listInfoCache: { [key: string]: IListInfo } = {};
}

export class DatasourceExecutor {
  static executeDatasource = async (
    knownSwaggerDatasources: KnownSwaggerDatasource[],
    datasource: DataSourceDefinition,
    datasourceTrigger: DatasourceTriggerConfig,
    dataObject: any,
    client: SPHttpClient,
    correlationIdForServerRequests: string
  ): Promise<any> => {
    switch (datasource.typeName) {
      case DatasourceTypeNames.SwaggerDatasource:
        const swaggerResult = await DatasourceExecutor.executeSwaggerDatasource(knownSwaggerDatasources, datasource, datasourceTrigger, dataObject, client, correlationIdForServerRequests);
        return swaggerResult;

      case DatasourceTypeNames.SharePointDatasource:
        const sharePointResult = await DatasourceExecutor.executeSharePointDatasource(datasource, datasourceTrigger, dataObject, client);
        return sharePointResult;
    }
  };

  private static executeSwaggerDatasource = async (
    knownSwaggerDatasources: KnownSwaggerDatasource[],
    datasource: DataSourceDefinition,
    datasourceTrigger: DatasourceTriggerConfig,
    dataObject: any,
    client: SPHttpClient,
    correlationIdForServerRequests: string
  ): Promise<any> => {
    const config = datasource.datasourceConfig as SwaggerDatasourceConfig;
    const knownSources = knownSwaggerDatasources.filter((ds) => ds.identifier === (datasource.datasourceConfig as SwaggerDatasourceConfig).knownSwaggerDatasourceId);
    if (knownSources.length === 0) {
      log.error("Es wurde keine passende Swaggerinformation zur Swaggerquelle gefunden", datasource, datasourceTrigger);
      throw new Error("no swagger source found with given id");
    }
    const url = knownSources[0].apiBaseUrl + config.operationId;

    let urlToUse = url;
    if (urlToUse.endsWith("/")) {
      urlToUse = urlToUse.substring(0, urlToUse.length - 2);
    }
    switch (config.operationType) {
      case "get":
        {
          if (datasourceTrigger.inputParameterMappings.length > 0) {
            let query = "?";
            datasourceTrigger.inputParameterMappings.forEach((mapping, index) => {
              const sourcePath = mapping.sourceParameter.path.split("/");
              const value = getValueFromPath(dataObject, sourcePath);
              const queryName = mapping.targetParameter.parameterName;
              query += queryName + "=" + encodeURIComponent(value as string);
              if (index !== datasourceTrigger.inputParameterMappings.length - 1) {
                query += "&";
              }
            });
            urlToUse += query;
            log.debug("datasource: created request url", urlToUse);
          }
          //const opt = { headers: { Accept: "application/json" }, mode: "cors", credentials: "include" };

          if (config.openUrlAsLink === true) {
            const link = document.createElement("a");
            link.href = urlToUse;
            link.target = "_blank";
            link.click();
          } else {
            try {
              const result = await client.get(urlToUse, SPHttpClient.configurations.v1, { credentials: "include", headers: { "X-Correlation-Id": correlationIdForServerRequests } });
              return await result.json();
            } catch (e) {
              log.error("could not execute datasource", datasourceTrigger, e);
              return null;
            }
          }
        }
        break;

      case "post": {
        try {
          const instance = axios.create({
            withCredentials: true,
            baseURL: urlToUse,
            headers: {
              "Content-Type": "application/json",
              "X-Correlation-Id": correlationIdForServerRequests,
              Accept: "application/json"
            }
          });

          const queryObject: { [key: string]: any } = {};
          let bodyObject: { [key: string]: any } = {};

          if (datasourceTrigger.inputParameterMappings.length > 0) {
            datasourceTrigger.inputParameterMappings.forEach((mapping, index) => {
              const sourcePath = mapping.sourceParameter.path.split("/");
              const value = getValueFromPath(dataObject, sourcePath);
              const parameterName = mapping.targetParameter.parameterName;
              switch (mapping.targetParameter.location) {
                case "query": {
                  queryObject[parameterName] = value;
                  break;
                }
                case "body": {
                  const targetPaths = mapping.targetParameter.path.split("/");
                  const parameterHasToBePlacedDirectlyIntoBody = targetPaths.length == 1;

                  if (parameterHasToBePlacedDirectlyIntoBody) {
                    bodyObject = value;
                  } else {
                    bodyObject[parameterName] = value;
                  }
                  break;
                }
                default:
                  bodyObject[parameterName] = value;
                  break;
              }
            });
          }

          const result = await instance.post(urlToUse, bodyObject, { params: queryObject, paramsSerializer: { indexes: true } });
          //const opt = { headers: { Accept: "application/json" }, mode: "cors", credentials: "include" };

          return result.data;
        } catch (e) {
          log.error(e);
          return null;
        }
      }
    }
  };
  private static executeSharePointDatasource = async (datasource: DataSourceDefinition, datasourceTrigger: DatasourceTriggerConfig, dataObject: any, client: SPHttpClient): Promise<any> => {
    const config = datasource.datasourceConfig as SharePointDatasourceConfig;
    const webKey = config.searchListInCurrentWeb === true ? "currentWeb" : config.serverRelativeWebUrl;

    const web = Cache.iwebCache[webKey] !== undefined ? Cache.iwebCache[webKey] : await getSharePointDatasourceWeb(config);
    if (Cache.iwebCache[webKey] === undefined) {
      Cache.iwebCache[webKey] = web;
    }

    const resolvedWeb = Cache.iWebInfoCache[webKey] !== undefined ? Cache.iWebInfoCache[webKey] : await web.get();
    if (Cache.iWebInfoCache[webKey] === undefined) {
      Cache.iWebInfoCache[webKey] = resolvedWeb;
    }

    const listKey = webKey + "_" + config.listName;

    const resolvedList = Cache.listInfoCache[listKey] !== undefined ? Cache.listInfoCache[listKey] : await web.lists.getByTitle(config.listName).get();
    if (Cache.listInfoCache[listKey] === undefined) {
      Cache.listInfoCache[listKey] = resolvedList;
    }

    const viewKey = listKey;

    const view = Cache.viewCache[viewKey] !== undefined ? Cache.viewCache[viewKey] : await web.lists.getByTitle(config.listName).defaultView.get();
    if (Cache.viewCache[viewKey] === undefined) {
      Cache.viewCache[viewKey] = view;
    }
    const listViewManager = createListViewManager(resolvedWeb.Url, resolvedList.Title, view.Title);
    const filter: Filter[] = createFilterBasedOnParameterMappings(datasourceTrigger.inputParameterMappings, dataObject);

    const objectsToReturn: any[] = [];
    let nextRef: string | undefined = undefined;

    do {
      const page = await listViewManager.loadPage(nextRef, filter, undefined, true, 5000);

      if (page.error !== undefined) {
        log.error(page.error);
        return []; // todo: exception handling?
      }

      if (page.model.result.length > 0) {
        page.model.result.forEach((resultItem) => {
          const flattedObjectToReturn: { [key: string]: any } = {};
          resultItem.getProperties().forEach((prop) => {
            flattedObjectToReturn[prop.description.internalName] = prop.value;
          });
          objectsToReturn.push(flattedObjectToReturn);
        });
      }

      nextRef = page.model.nextRef;
    } while (nextRef !== undefined && nextRef !== "");

    if (objectsToReturn.length > 0) {
      log.debug("sharepoint datasource, first object from list", objectsToReturn);
      return objectsToReturn;
    }
    return Promise.resolve(null);
  };
}
const createFilterBasedOnParameterMappings = (mappings: ParameterMapping[], dataObject: any): Filter[] => {
  const filter = mappings.map((mapping): Filter => {
    const sourcePath = mapping.sourceParameter.path.split("/");
    const value = getValueFromPath(dataObject, sourcePath);

    return {
      fieldName: mapping.targetParameter.parameterName,
      fieldType: mapping.targetParameter.type as string,
      values: [value]
    };
  });
  log.debug("created filter based on mappings", { mappings: mappings, dataObject: dataObject, mappedFilter: filter });
  return filter;
};
