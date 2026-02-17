import { DatasourceTypeNames } from "./DataSourceTypes";
import { SharePointDatasourceConfig } from "./SharePointDatasourceConfig";
import { SwaggerDatasourceConfig } from "./SwaggerDatasourceConfig";

export interface DataSourceDefinition {
  typeName: "SharePointDatasource" | "SwaggerDatasource";
  title: string;
  uniqueIdentifier: string;
  datasourceConfig: SharePointDatasourceConfig | SwaggerDatasourceConfig;
}
