import React, { useEffect, useRef, useState } from "react";

import { Guid } from "@microsoft/sp-core-library";
import { createEfav2Client } from "../../clients/efav2ClientCreator";
import { EfaClient, SendLogDto } from "../../clients/efav2Client";

import { ConfigListService } from "../configListService/ConfigListService";
import { sp } from "@pnp/sp";
import { useLoadingIndicatorContext } from "../helper/LoadingIndicatorContext";
import { Logmodel } from "./LogModel";

export interface IServerLoggingContext {
  logTrace: (logModel: Logmodel) => void;
  getCurrentCorrelationId: () => string;
  logCollectedLogsAsError: (logModel: Logmodel) => void | Promise<void>;
}

export const ServerLoggingContext = React.createContext<IServerLoggingContext | undefined>(undefined);
export const useServerLoggingContext = () => React.useContext(ServerLoggingContext);

export const ServerLoggingContextProvider = (props: { children: JSX.Element | JSX.Element[] }) => {
  const currentCorrelationId = useRef<string>(Guid.newGuid().toString());
  const clientReference = useRef<EfaClient | undefined>(undefined);

  const loggingIsEnabled = useRef<boolean>(false);
  const collectedLogs = useRef<Logmodel[]>([]);
  const loadingContext = useLoadingIndicatorContext();
  useEffect(() => {
    const loadConfig = async () => {
      loadingContext.setLoadingIndication(true, "LoggingConfiguration wird geladen");
      const config = await ConfigListService.getConfigString(sp.web, "RemoteLoggingEnabled");
      loggingIsEnabled.current = config !== null && config.config == "Ja";
      loadingContext.setLoadingIndication(false);
    };
    loadConfig();
  }, []);
  return (
    <ServerLoggingContext.Provider
      value={{
        getCurrentCorrelationId: () => currentCorrelationId.current,
        logTrace: async (logModel: Logmodel) => {
          if (loggingIsEnabled.current === true) {
            if (clientReference.current == undefined) {
              const efaV2Client = await createEfav2Client(currentCorrelationId.current);
              clientReference.current = efaV2Client;
            }
            var dto = new SendLogDto({ message: JSON.stringify(logModel) });
            clientReference.current.logInfo(dto);
          }
          collectedLogs.current.push(logModel);
        },
        logCollectedLogsAsError: async (logModel: Logmodel) => {
          if (clientReference.current == undefined) {
            const efaV2Client = await createEfav2Client(currentCorrelationId.current);
            clientReference.current = efaV2Client;
          }
          const errorMessageObject: any = {
            error: logModel,
            logHistory: collectedLogs.current
          };

          var dto = new SendLogDto({ message: JSON.stringify(errorMessageObject) });
          await clientReference.current.logError(dto);
          collectedLogs.current = [];
        }
      }}>
      <></>
      {props.children}
    </ServerLoggingContext.Provider>
  );
};

export const ServerLoggingContextConsumer: React.FC<{
  children: (infos: IServerLoggingContext) => JSX.Element;
}> = (props): JSX.Element => {
  return <ServerLoggingContext.Consumer>{(ctx) => <>{props.children(ctx)}</>}</ServerLoggingContext.Consumer>;
};
