import * as React from "react";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { SPHttpClient, HttpClient } from "@microsoft/sp-http";

import { ServerLoggingContextProvider } from "../../../common/logging/ServerLoggingContext";
import { FormInstance } from "./FormInstance";
const background = require("../../../../sharepoint/assets/background.svg");

export const FormInstanceWithRemoteLogger = (props: { httpClient: HttpClient; spHttpClient: SPHttpClient; context: BaseComponentContext; instanceId: string }): JSX.Element => {
  return (
    <ServerLoggingContextProvider>
      <FormInstance {...props} />
    </ServerLoggingContextProvider>
  );
};
