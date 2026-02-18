import * as React from "react";
import * as ReactDom from "react-dom";
import { BaseClientSideWebPart, IPropertyPaneConfiguration, PropertyPaneTextField } from "@microsoft/sp-webpart-base";

import * as strings from "FormRedirectWebPartOnlineWebPartStrings";
import { FormRedirectWebPart } from "./components/FormRedirectWebPart";
import { IFormRedirectWebPartProps } from "./components/IFormRedirectWebPartProps";

export interface IFormRedirectWebPartWebPartProps {
  description: string;
}

export default class FormRedirectWebPartWebPart extends BaseClientSideWebPart<IFormRedirectWebPartWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IFormRedirectWebPartProps> = React.createElement(FormRedirectWebPart, {
      instanceId: this.instanceId,
      context: this.context
    });

    ReactDom.render(element, this.domElement);
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
