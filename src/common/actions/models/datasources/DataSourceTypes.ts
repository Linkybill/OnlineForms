import { SharePointDatasourceConfig } from "./SharePointDatasourceConfig";
import { SwaggerDatasourceConfig } from "./SwaggerDatasourceConfig";

export class DatasourceTypeNames {
  public static readonly SharePointDatasource = "SharePointDatasource";
  public static readonly SwaggerDatasource = "SwaggerDatasource";
}

export type DatasourceConfigTypes = SharePointDatasourceConfig | SwaggerDatasourceConfig;
