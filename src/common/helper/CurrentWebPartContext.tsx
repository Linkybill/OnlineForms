import { BaseComponentContext } from "@microsoft/sp-component-base";
import { SPHttpClient, HttpClient } from "@microsoft/sp-http";
import * as React from "react";

const CurrentComponentContext = React.createContext<{ context: BaseComponentContext; spHttpClient: SPHttpClient; httpClient: HttpClient }>({} as any);

export const useComponentContext = () => React.useContext(CurrentComponentContext);

export const ComponentContextProvider: React.FC<{
  children?: string | string[] | JSX.Element | JSX.Element[];
  componentContext: BaseComponentContext;
  spHttpClient: SPHttpClient;
  httpClient: HttpClient;
}> = (props) => {
  return (
    <CurrentComponentContext.Provider
      value={{
        httpClient: props.httpClient,
        context: props.componentContext,
        spHttpClient: props.spHttpClient
      }}>
      {props.children}
    </CurrentComponentContext.Provider>
  );
};
