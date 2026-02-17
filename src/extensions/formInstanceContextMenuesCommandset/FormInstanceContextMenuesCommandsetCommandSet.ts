import { override } from "@microsoft/decorators";

import { BaseListViewCommandSet, Command, IListViewCommandSetListViewUpdatedParameters, IListViewCommandSetExecuteEventParameters } from "@microsoft/sp-listview-extensibility";

import { CommandNames, ListNames } from "./Constans";
import { sp } from "@pnp/sp/presets/all";

import { createRoot } from "react-dom/client";
import React from "react";
import { closePanels } from "../common/ClosePanels";
import { FormInstanceListActionsWrapper } from "./components/FormInstanceListActionsWrapper";

import { BaseComponentContext } from "@microsoft/sp-component-base";
import { openArchiveFormDialog } from "../common/OpenArchiveFormDialog";
/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IFormInstanceContextMenuesCommandsetCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}
const LOG_SOURCE: string = "FormInstanceContextMenuesCommandsetCommandSet";
export default class FormInstanceContextMenuesCommandsetCommandSet extends BaseListViewCommandSet<IFormInstanceContextMenuesCommandsetCommandSetProperties> {
  private panelPlaceHolder: HTMLDivElement | undefined = undefined;

  @override
  public async onInit(): Promise<void> {
    const newFormInstanceCommand: Command = this.tryGetCommand(CommandNames.COMMAND_NewFormInstance);
    const openFormCommand: Command = this.tryGetCommand(CommandNames.COMMAND_OpenFormInstance);
    const cancelFormCommand: Command = this.tryGetCommand(CommandNames.COMMAND_CancelFormInstance);
    if (newFormInstanceCommand) {
      // This command should be hidden unless exactly one row is selected.
      newFormInstanceCommand.visible = this.context.pageContext.list.title === ListNames.formInstancelistName;
    }
    if (openFormCommand) {
      openFormCommand.visible = false;
    }
    if (cancelFormCommand) {
      cancelFormCommand.visible = false;
    }

    if (this.panelPlaceHolder === undefined) {
      this.panelPlaceHolder = document.body.appendChild(document.createElement("div"));
      const root = createRoot(this.panelPlaceHolder);
      root.render(
        React.createElement(FormInstanceListActionsWrapper, {
          onClose: (): void => {
            closePanels();
          },
          componentContext: this.context as BaseComponentContext,
          spHttpClient: this.context.spHttpClient,
          httpClient: this.context.httpClient
        })
      );
    }

    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    if (this.context.pageContext.list.title === ListNames.formInstancelistName) {
      const openFormCommand: Command = this.tryGetCommand(CommandNames.COMMAND_OpenFormInstance);
      const cancelCommand: Command = this.tryGetCommand(CommandNames.COMMAND_CancelFormInstance);
      if (openFormCommand) {
        openFormCommand.visible = this.context.pageContext.list.title === ListNames.formInstancelistName && event.selectedRows.length === 1;
      }
      if (cancelCommand) {
        cancelCommand.visible = this.context.pageContext.list.title === ListNames.formInstancelistName && event.selectedRows.length === 1;
      }
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    const source = encodeURIComponent(window.location.href);
    switch (event.itemId) {
      case "COMMAND_OpenFormInstance":
        sp.setup({
          spfxContext: {
            pageContext: this.context.pageContext

            //aadTokenProviderFactory: context.aadTokenProviderFactory,
            //msGraphClientFactory: context.msGraphClientFactory.getClient as any, // todo: check graph integration?
          }
        });
        const doRedirectToUrlWithFormOriginalName = async () => {
          const selectedItemId = event.selectedRows[0].getValueByName("ID");
          const item = await sp.web.lists.getByTitle(ListNames.formInstancelistName).items.getById(selectedItemId).get();
          const formOriginalName = item["EFAFormOriginalName"].replace(".json", "");
          const urlForOpeningForm = this.context.pageContext.web.absoluteUrl + "/SitePages/FormInstance.aspx?openInPanel=1&formId=" + formOriginalName + "&source=" + source;
          window.location.href = urlForOpeningForm;
        };
        doRedirectToUrlWithFormOriginalName();

        break;
      case "COMMAND_NewFormInstance":
        const url = this.context.pageContext.web.absoluteUrl + "/SitePages/FormInstance.aspx?openInPanel=1&source=" + source;
        window.location.href = url;
        break;
      case "COMMAND_CancelFormInstance":
        const selectedItemId = event.selectedRows[0].getValueByName("ID");
        openArchiveFormDialog(selectedItemId);

        break;
      default:
        throw new Error("Unknown command");
    }
  }
}
