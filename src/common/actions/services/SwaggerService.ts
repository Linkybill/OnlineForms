import log from "loglevel";
import { SPHttpClient } from "@microsoft/sp-http";
export const loadSwaggerSchema = async (swaggerSchemaUrl: string, spHttpclient: SPHttpClient): Promise<any> => {
  log.debug("swaggerdatasourcefonfig: loading swaggerinfos", swaggerSchemaUrl);

  const result = await spHttpclient.fetch(swaggerSchemaUrl, SPHttpClient.configurations.v1, {});
  const json = await result.json();
  log.debug(result, json);
  return json;
};
