import React from "react";
import { DatasourceConfigTypes, DatasourceTypeNames } from "../../models/datasources/DataSourceTypes";
import { SharePointDatasourceConfigEditor } from "./SharePointDatasourceConfigEditor";
import { SharePointDatasourceConfig } from "../../models/datasources/SharePointDatasourceConfig";
import log from "loglevel";
import { SwaggerDataSourceConfigEditor } from "./SwaggerDatasourceConfigEditor";
import { SwaggerDatasourceConfig } from "../../models/datasources/SwaggerDatasourceConfig";

export const DatasourceConfigEditor = (props: { configTypeName: string; datasourceConfig: DatasourceConfigTypes; onConfigChanged: (config: DatasourceConfigTypes) => void }): JSX.Element => {
  return (
    <>
      {props.configTypeName === DatasourceTypeNames.SharePointDatasource && (
        <SharePointDatasourceConfigEditor sharePointDatasourceConfig={props.datasourceConfig as SharePointDatasourceConfig} onConfigChanged={props.onConfigChanged}></SharePointDatasourceConfigEditor>
      )}
      {props.configTypeName === DatasourceTypeNames.SwaggerDatasource && (
        <SwaggerDataSourceConfigEditor onConfigChanged={props.onConfigChanged} swaggerDatasourceConfig={props.datasourceConfig as SwaggerDatasourceConfig} />
      )}
    </>
  );
};
