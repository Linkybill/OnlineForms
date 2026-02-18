import { override } from "@microsoft/decorators";
import { BaseListViewCommandSet, Command, IListViewCommandSetListViewUpdatedParameters, IListViewCommandSetExecuteEventParameters } from "@microsoft/sp-listview-extensibility";

import { CommandNames, FormTemplateFieldNames, ListNames, UrlParameterNames } from "./Constants";
import * as ReactDom from "react-dom";
import { FormTemplateListActionsWrapper } from "./components/formTemplateEditor/FormTemplateListActionsWrapper";
import React from "react";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { closePanels } from "../common/ClosePanels";
import { openNewTemplateDialog } from "../common/OpenNewTemplateDialog";
import { sp } from "@pnp/sp";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IFormTemplateListActionsCommandSetProperties {}

const LOG_SOURCE: string = "FormTemplateListActionsCommandSet";

export default class FormTemplateListActionsCommandSet extends BaseListViewCommandSet<IFormTemplateListActionsCommandSetProperties> {
  private panelPlaceHolder: HTMLDivElement | undefined = undefined;
  private selectedItemIds: number[] = [];

  private async openEditTemplateDialog(): Promise<void> {
    const id = this.selectedItemIds[0];
    const item = await sp.site.rootWeb.lists.getByTitle(ListNames.formTemplateListName).items.getById(id).get();
    const identifier = item[FormTemplateFieldNames.templateIdentifier];
    const web = await sp.web.get();
    const targetUrl = `${web.Url}/SitePages/FormTemplate.aspx?${UrlParameterNames.templateIdentifier}=${encodeURIComponent(identifier)}&openInPanel=1`;
    window.location.href = targetUrl;
  }
  @override
  public async onInit(): Promise<void> {
    const newTemplateCommand: Command = this.tryGetCommand(CommandNames.Command_NewTemplate);
    const editTemplateCommand: Command = this.tryGetCommand(CommandNames.Command_EditTemplate);
    if (newTemplateCommand) {
      // Keep visible during debug; list filtering is handled elsewhere.
      newTemplateCommand.visible = true;
    }
    if (editTemplateCommand) {
      editTemplateCommand.visible = false;
    }

    if (this.panelPlaceHolder === undefined) {
      this.panelPlaceHolder = document.body.appendChild(document.createElement("div"));
      ReactDom.render(
        React.createElement(
          FormTemplateListActionsWrapper,
          {
            onClose: (): void => {
              closePanels();
            },
            componentContext: this.context as BaseComponentContext,
            spHttpClient: this.context.spHttpClient,
            httpClient: this.context.httpClient
          },
          null
        ),
        this.panelPlaceHolder
      );
    }

    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    this.selectedItemIds = event.selectedRows.map((r) => r.getValueByName("ID"));
    const editTemplateCommand: Command = this.tryGetCommand(CommandNames.Command_EditTemplate);
    if (editTemplateCommand) {
      editTemplateCommand.visible = event.selectedRows.length === 1;
    }
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case CommandNames.Command_NewTemplate:
        openNewTemplateDialog(undefined);
        break;
      case CommandNames.Command_EditTemplate:
        this.openEditTemplateDialog();
        break;
      default:
        throw new Error("Unknown command");
    }
  }
}
