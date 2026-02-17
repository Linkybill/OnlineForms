import { override } from "@microsoft/decorators";
import { Log } from "@microsoft/sp-core-library";
import { BaseApplicationCustomizer } from "@microsoft/sp-application-base";
import { Dialog } from "@microsoft/sp-dialog";
import { SPHttpClient } from "@microsoft/sp-http";
import * as strings from "NovaFormsAppCustomizerApplicationCustomizerStrings";
import { ActiveListFieldNames, ListNames } from "../formTemplateListActions/Constants";

import log from "loglevel";

const LOG_SOURCE: string = "NovaFormsAppCustomizerApplicationCustomizer";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface INovaFormsAppCustomizerApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class NovaFormsAppCustomizerApplicationCustomizer extends BaseApplicationCustomizer<INovaFormsAppCustomizerApplicationCustomizerProperties> {
  @override
  public async onInit(): Promise<void> {
    log.debug("loaded app customizer");
    const isInAktiveFormsList = this.context.pageContext.list?.title === ListNames.aktiveFormsListName;

    const queryParams = new URLSearchParams(window.location.search);
    const folderParam = queryParams.get("RootFolder");

    // Prüfen, ob ein Subfolder vorliegt:
    const isInSubFolder = folderParam && folderParam.toLowerCase().includes(`/${ListNames.aktiveFormsListName.toLowerCase()}/`);

    if (isInAktiveFormsList && isInSubFolder) {
      const id = queryParams.get("ID");
      if (id) {
        try {
          const requestUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${ListNames.aktiveFormsListName}')/items(${id})`;
          const result = await this.context.httpClient.get(requestUrl, SPHttpClient.configurations.v1, {
            headers: {
              Accept: "application/json;odata=nometadata"
            }
          });
          var formItem = await result.json();
          const formWebUrl = this.context.pageContext.web.absoluteUrl;
          var originalName = formItem[ActiveListFieldNames.originalFileName];
          var url = formWebUrl + "/sitePages/formInstance.aspx?openInPanel=1&formId=" + originalName;
          window.location.href = url;
        } catch (e) {
          log.error("Redirect konnte nicht durchgeführt werden", e);
        }
      }
    }
    return Promise.resolve();
  }
}
