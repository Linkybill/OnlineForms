import { override } from "@microsoft/decorators";
import { BaseListViewCommandSet, Command, IListViewCommandSetListViewUpdatedParameters, IListViewCommandSetExecuteEventParameters } from "@microsoft/sp-listview-extensibility";

import { CommandNames, ListNames } from "./Constants";
import { createRoot } from "react-dom/client";
import { FormTemplateListActionsWrapper } from "./components/formTemplateEditor/FormTemplateListActionsWrapper";
import React from "react";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { closePanels } from "../common/ClosePanels";
import { openNewTemplateDialog } from "../common/OpenNewTemplateDialog";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IFormTemplateListActionsCommandSetProperties {}

const LOG_SOURCE: string = "FormTemplateListActionsCommandSet";

export default class FormTemplateListActionsCommandSet extends BaseListViewCommandSet<IFormTemplateListActionsCommandSetProperties> {
  private panelPlaceHolder: HTMLDivElement | undefined = undefined;
  @override
  public async onInit(): Promise<void> {
    const newTemplateCommand: Command = this.tryGetCommand(CommandNames.Command_NewTemplate);
    if (newTemplateCommand) {
      // This command should be hidden unless exactly one row is selected.
      newTemplateCommand.visible = this.context.pageContext.list.title === ListNames.formTemplateListName;
    }

    if (this.panelPlaceHolder === undefined) {
      this.panelPlaceHolder = document.body.appendChild(document.createElement("div"));
      const root = createRoot(this.panelPlaceHolder);
      root.render(
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
        )
      );
    }

    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {}

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case CommandNames.Command_NewTemplate:
        openNewTemplateDialog(undefined);
        break;
      default:
        throw new Error("Unknown command");
    }
  }
}
