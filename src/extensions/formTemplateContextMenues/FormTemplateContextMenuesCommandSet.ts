import { override } from "@microsoft/decorators";
import { Log } from "@microsoft/sp-core-library";
import { BaseListViewCommandSet, IListViewCommandSetListViewUpdatedParameters, IListViewCommandSetExecuteEventParameters } from "@microsoft/sp-listview-extensibility";
import { createRoot } from "react-dom/client";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { MessageTypes, WindowMessage } from "../common/models/WindowMessage";
import { CommandNames, FormTemplateFieldNames, ListNames } from "../formTemplateListActions/Constants";
import React from "react";
import { Wrapper } from "./components/formTemplateEditor/Wrapper";
import { closePanels } from "../common/ClosePanels";
import { createNewVersionOfTemplate, getAssociatedWebUrlsForTemplateIdentifier } from "../../common/formTemplates/services/FormTemplateService";
import { sp } from "@pnp/sp";
import { openNewTemplateDialog } from "../common/OpenNewTemplateDialog";

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IFormTemplateContextMenuesCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}

const LOG_SOURCE: string = "FormTemplateContextMenuesCommandSet";

export default class FormTemplateContextMenuesCommandSet extends BaseListViewCommandSet<IFormTemplateContextMenuesCommandSetProperties> {
  selectedItemIds: number[] = [];
  private panelPlaceHolder: HTMLDivElement | undefined = undefined;

  openEditTemplateDialog = async () => {
    const id = this.selectedItemIds[0];
    const item = await sp.site.rootWeb.lists.getByTitle(ListNames.formTemplateListName).items.getById(id).get();
    const identifier = item[FormTemplateFieldNames.templateIdentifier];
    const urls = await getAssociatedWebUrlsForTemplateIdentifier(identifier);
    const message: WindowMessage = {
      messageId: MessageTypes.showTemplateWebUrlDropdownsWithRedirectToEditorInSubWeb,
      templateItemId: id,
      urlsForRedirectToEditorInSubWeb: urls.map((c) => c.config)
    };
    window.postMessage(message, window.location.href);
  };

  @override
  public async onInit(): Promise<void> {
    const editCommand = this.tryGetCommand(CommandNames.Command_EditTemplate);
    const createNewVersionBasedOnTemplate = this.tryGetCommand(CommandNames.COMMAND_NewVersionOfTemplate);
    const newTemplateBasedOnTemplateCommand = this.tryGetCommand(CommandNames.COMMAND_NewTemplateBasedOnTemplate);
    if (editCommand) {
      // This command should be hidden unless exactly one row is selected.
      editCommand.visible = this.context.pageContext.list.title === ListNames.formTemplateListName;
    }
    if (createNewVersionBasedOnTemplate) {
      createNewVersionBasedOnTemplate.visible = this.context.pageContext.list.title === ListNames.formTemplateListName;
    }
    if (newTemplateBasedOnTemplateCommand) {
      newTemplateBasedOnTemplateCommand.visible = this.context.pageContext.list.title === ListNames.formTemplateListName;
    }

    if (this.panelPlaceHolder === undefined) {
      this.panelPlaceHolder = document.body.appendChild(document.createElement("div"));
      const root = createRoot(this.panelPlaceHolder);
      root.render(
        React.createElement(
          Wrapper,
          {
            onClose: (): void => {
              closePanels();
            },
            componentContext: this.context as BaseComponentContext,
            spHttpClient: this.context.spHttpClient
          },
          null
        )
      );
    }
    Log.info(LOG_SOURCE, "Initialized FormTemplateContextMenuesCommandSet");
    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    this.selectedItemIds = event.selectedRows.map((r) => r.getValueByName("ID"));

    const editCommand = this.tryGetCommand(CommandNames.Command_EditTemplate);
    const createNewVersionBasedOnTemplate = this.tryGetCommand(CommandNames.COMMAND_NewVersionOfTemplate);
    const createNewTemplateBasedOnTemplate = this.tryGetCommand(CommandNames.COMMAND_NewTemplateBasedOnTemplate);

    if (editCommand) {
      // This command should be hidden unless exactly one row is selected.
      editCommand.visible = event.selectedRows.length === 1 && this.context.pageContext.list.title === ListNames.formTemplateListName;
    }
    if (createNewVersionBasedOnTemplate) {
      createNewVersionBasedOnTemplate.visible = event.selectedRows.length === 1 && this.context.pageContext.list.title === ListNames.formTemplateListName;
    }
    if (createNewTemplateBasedOnTemplate) {
      createNewTemplateBasedOnTemplate.visible = event.selectedRows.length === 1 && this.context.pageContext.list.title === ListNames.formTemplateListName;
    }
  }

  @override
  public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
    switch (event.itemId) {
      case CommandNames.Command_EditTemplate:
        this.openEditTemplateDialog();
        break;
      case CommandNames.COMMAND_NewVersionOfTemplate:
        const result = await createNewVersionOfTemplate(this.selectedItemIds[0]);
        if (result.error !== undefined) {
          alert("Templateversion konnte nicht erzeugt werden. " + result.error);
        }
        break;
      case CommandNames.COMMAND_NewTemplateBasedOnTemplate:
        openNewTemplateDialog(this.selectedItemIds[0]);
        break;
      default:
        throw new Error("Unknown command");
    }
  }
}
