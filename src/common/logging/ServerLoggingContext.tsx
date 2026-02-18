import React, { useEffect, useRef, useState } from "react";
import log from "loglevel";

import { Guid } from "@microsoft/sp-core-library";
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
            log.warn("Remote logging is enabled but no remote logger is configured in SPO.");
          }
          collectedLogs.current.push(logModel);
        },
        logCollectedLogsAsError: async (logModel: Logmodel) => {
          const errorMessageObject: any = {
            error: logModel,
            logHistory: collectedLogs.current
          };
          if (loggingIsEnabled.current === true) {
            log.warn("Remote logging is enabled but no remote logger is configured in SPO.", errorMessageObject);
          }
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
