import axios from "axios";
import { EfaClient } from "./efav2Client";
import { ConfigListService } from "../common/configListService/ConfigListService";
import { sp } from "@pnp/sp";

export const createEfav2Client = async (correlationIdForHeader: string) => {
  const instance = axios.create({
    withCredentials: true,
    headers: {
      "X-Correlation-Id": correlationIdForHeader
    }
  });

  const configNameForBaseUrl = "efaV2ControllerBaseUrl";
  const config = await ConfigListService.getConfigString(sp.site.rootWeb, configNameForBaseUrl);
  return new EfaClient(config.config, instance);
};
