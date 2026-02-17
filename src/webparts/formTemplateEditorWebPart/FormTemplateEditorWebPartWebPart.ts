import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart, IPropertyPaneConfiguration, PropertyPaneTextField } from "@microsoft/sp-webpart-base";

import * as strings from "FormTemplateEditorWebPartWebPartStrings";
import { FormTemplateEditorWebPart } from "./components/FormTemplateEditorWebPart";
import { IFormTemplateEditorWebPartProps } from "./components/IFormTemplateEditorWebPartProps";
import { RemoteLoggingContextWithFormTemplateEditorWebPart } from "./components/RemoteLoggingContextWithFormTemplateEditorWebPart";

export interface IFormTemplateEditorWebPartWebPartProps {
  description: string;
}

export default class FormTemplateEditorWebPartWebPart extends BaseClientSideWebPart<IFormTemplateEditorWebPartWebPartProps> {
  public render(): void {
    const props: IFormTemplateEditorWebPartProps = {
      componentContext: this.context,
      spHttpClient: this.context.spHttpClient,
      httpClient: this.context.httpClient,
      instanceId: this.instanceId
    };
    const element: React.ReactElement<IFormTemplateEditorWebPartProps> = React.createElement(RemoteLoggingContextWithFormTemplateEditorWebPart, props);

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
