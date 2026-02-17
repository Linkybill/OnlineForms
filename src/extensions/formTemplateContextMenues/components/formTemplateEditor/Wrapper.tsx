import React from "react";
import { FormTemplateContextMenuHandler } from "./FormTemplateContextMenuHandler";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { SPHttpClient } from "@microsoft/sp-http";

import { AppConfigurator } from "../../../../common/AppConfigurator/AppConfigurator";
import { CustomThemeProvider } from "../../../../common/CustomThemeProvider/CustomThemeProvider";

export const Wrapper = (props: { componentContext: BaseComponentContext; spHttpClient: SPHttpClient; onClose: () => void }): JSX.Element => {
  return (
    <AppConfigurator companyName="Nova" componentContext={props.componentContext} solutionName="Forms">
      <CustomThemeProvider>
        <FormTemplateContextMenuHandler onClose={props.onClose} componentContext={props.componentContext} spHttpClient={props.spHttpClient} />
      </CustomThemeProvider>
    </AppConfigurator>
  );
};
