import React from "react";
import { FormTemplateEditorPanel } from "../../../common/components/FormTemplateEditorPanel";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { SPHttpClient, HttpClient } from "@microsoft/sp-http";

import { CustomThemeProvider } from "../../../../common/CustomThemeProvider/CustomThemeProvider";
import { AppConfigurator } from "../../../../common/AppConfigurator/AppConfigurator";
import { ThemeProvider } from "@fluentui/react";

export const FormTemplateListActionsWrapper = (props: { componentContext: BaseComponentContext; httpClient: HttpClient; spHttpClient: SPHttpClient; onClose: () => void }): JSX.Element => {
  return (
    <AppConfigurator companyName="Nova" solutionName="Forms" componentContext={props.componentContext}>
      <ThemeProvider>
        <CustomThemeProvider>
          <FormTemplateEditorPanel httpClient={props.httpClient} onClose={props.onClose} componentContext={props.componentContext} spHttpClient={props.spHttpClient} />
        </CustomThemeProvider>
      </ThemeProvider>
    </AppConfigurator>
  );
};
