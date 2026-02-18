import * as React from "react";
import * as ReactDom from "react-dom";
import { BaseClientSideWebPart, IPropertyPaneConfiguration, PropertyPaneTextField } from "@microsoft/sp-webpart-base";

import * as strings from "FormInstanceOnlineWebPartStrings";
import { FormInstanceWithRemoteLogger } from "./components/RemoteLoggerWithFormInstance";

export interface IFormInstanceWebPartProps {
  description: string;
}

export default class FormInstanceWebPart extends BaseClientSideWebPart<IFormInstanceWebPartProps> {
  public render() {
    this.context.spHttpClient.get;
    ReactDom.render(
      React.createElement(FormInstanceWithRemoteLogger, {
        context: this.context,
        httpClient: this.context.httpClient,
        instanceId: this.instanceId,
        spHttpClient: this.context.spHttpClient
      }),
      this.domElement
    );
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
