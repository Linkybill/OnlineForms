import React from "react";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { SPHttpClient, HttpClient } from "@microsoft/sp-http";

import { ThemeProvider } from "@fluentui/react";
import { AppConfigurator } from "../../../common/AppConfigurator/AppConfigurator";
import { CustomThemeProvider } from "../../../common/CustomThemeProvider/CustomThemeProvider";

import { FormInstanceArchivePanel } from "../../common/components/FormInstanceArchivePanel";

export const FormInstanceListActionsWrapper = (props: { componentContext: BaseComponentContext; httpClient: HttpClient; spHttpClient: SPHttpClient; onClose: () => void }): JSX.Element => {
  return (
    <AppConfigurator companyName="Nova" solutionName="Forms" componentContext={props.componentContext}>
      <ThemeProvider>
        <CustomThemeProvider>
          <FormInstanceArchivePanel httpClient={props.httpClient} onClose={props.onClose} componentContext={props.componentContext} spHttpClient={props.spHttpClient} />
        </CustomThemeProvider>
      </ThemeProvider>
    </AppConfigurator>
  );
};
