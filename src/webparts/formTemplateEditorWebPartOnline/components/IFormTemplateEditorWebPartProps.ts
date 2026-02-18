import { BaseComponentContext } from "@microsoft/sp-component-base";
import { SPHttpClient, HttpClient } from "@microsoft/sp-http";
export interface IFormTemplateEditorWebPartProps {
  instanceId: string;
  spHttpClient: SPHttpClient;
  httpClient: HttpClient;
  componentContext: BaseComponentContext;
}
