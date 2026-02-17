import { Guid } from "@microsoft/sp-core-library";
import { DataSourceDefinition } from "../models/datasources/DataSourceDefinition";
import { DatasourceConfigTypes, DatasourceTypeNames } from "../models/datasources/DataSourceTypes";
import { SharePointDatasourceConfig } from "../models/datasources/SharePointDatasourceConfig";
import { SwaggerDatasourceConfig } from "../models/datasources/SwaggerDatasourceConfig";
import { ParameterMapping } from "../models/datasources/ParameterMapping";
import log from "loglevel";
import { SPHttpClient } from "@microsoft/sp-http";
import { DatasourceTriggerConfig } from "../models/datasources/DatasourceTriggerConfig";
import { sp } from "@pnp/sp";
import { getIWebObjectForServerRelativeUrl } from "../../helper/SPHelper";
import { IWeb } from "@pnp/sp/webs";

export const createEmptyDatasourceDefinition = (title: string): DataSourceDefinition => {
  const defaultType = DatasourceTypeNames.SharePointDatasource;
  return {
    title: title,
    datasourceConfig: createEmptyDatasourceConfig(defaultType),
    typeName: defaultType,
    uniqueIdentifier: Guid.newGuid().toString()
  };
};

export const getSharePointDatasourceWeb = (config: SharePointDatasourceConfig): Promise<IWeb> => {
  if (config.searchListInCurrentWeb === true) {
    return Promise.resolve(sp.web);
  } else {
    return getIWebObjectForServerRelativeUrl(config.serverRelativeWebUrl);
  }
};

export const createEmptyDatasourceConfig = (type: string): DatasourceConfigTypes => {
  const emptySharePointDatasource: SharePointDatasourceConfig = {
    listName: "",
    serverRelativeWebUrl: "",
    searchListInCurrentWeb: false
  };

  switch (type) {
    case DatasourceTypeNames.SharePointDatasource:
      return emptySharePointDatasource;
    case DatasourceTypeNames.SwaggerDatasource:
      const emptySwaggerDatasource: SwaggerDatasourceConfig = {
        operationId: "",
        knownSwaggerDatasourceId: "",
        operationType: "get"
      };
      return emptySwaggerDatasource;
  }
  return emptySharePointDatasource;
};

export const createEmptyDatasourceTriggerConfig = (): DatasourceTriggerConfig => {
  return {
    datasourceIdWhichGetsTriggered: "",
    inputParameterMappings: [],
    parameterName: ""
  };
};

export const loadInitalInputParameterMappingsForDatasource = (datasource: DataSourceDefinition, client: SPHttpClient): Promise<ParameterMapping[]> => {
  if (datasource === undefined) {
    return Promise.resolve([]);
  }
  switch (datasource.typeName) {
    case DatasourceTypeNames.SwaggerDatasource:
      return Promise.resolve([]);
  }
  return Promise.resolve([]);
};

export const findOperationIdObject = (swaggerSchema: any, operationPath: string, operationType: string): any | undefined => {
  const pathObject = swaggerSchema.paths[operationPath];
  if (pathObject !== undefined && pathObject[operationType] !== undefined) {
    return pathObject;
  }

  return undefined;
};
