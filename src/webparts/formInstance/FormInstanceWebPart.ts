import * as React from "react";
import * as ReactDom from "react-dom";
import { BaseClientSideWebPart, IPropertyPaneConfiguration, PropertyPaneTextField } from "@microsoft/sp-webpart-base";
import { createRoot } from "react-dom/client";

import * as strings from "FormInstanceWebPartStrings";
import { FormInstanceWithRemoteLogger } from "./components/RemoteLoggerWithFormInstance";

export interface IFormInstanceWebPartProps {
  description: string;
}

export default class FormInstanceWebPart extends BaseClientSideWebPart<IFormInstanceWebPartProps> {
  public render() {
    const root = createRoot(this.domElement);
    this.context.spHttpClient.get;
    root.render(React.createElement(FormInstanceWithRemoteLogger, { context: this.context, httpClient: this.context.httpClient, instanceId: this.instanceId, spHttpClient: this.context.spHttpClient }));
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
