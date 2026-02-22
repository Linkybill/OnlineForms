import { override } from "@microsoft/decorators";

import { BaseListViewCommandSet, Command, IListViewCommandSetListViewUpdatedParameters, IListViewCommandSetExecuteEventParameters } from "@microsoft/sp-listview-extensibility";

import { CommandNames } from "./Constans";
import { sp } from "@pnp/sp/presets/all";

import React from "react";
import * as ReactDom from "react-dom";
import { closePanels } from "../common/ClosePanels";
import { FormInstanceListActionsWrapper } from "./components/FormInstanceListActionsWrapper";

import { BaseComponentContext } from "@microsoft/sp-component-base";
import { openArchiveFormDialog } from "../common/OpenArchiveFormDialog";
import { ActiveListFieldNames, ListNames } from "../formTemplateListActionsOnline/Constants";
import { ConfigListService } from "../../common/configListService/ConfigListService";
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
  private hasConfiguredTemplate: boolean = false;
  private lastHasSelection: boolean = false;
  private isInitialized: boolean = false;

  private async initializeVisibilityState(): Promise<void> {
    try {
      sp.setup({
        spfxContext: {
          pageContext: this.context.pageContext
        }
      });

      const listId = this.context.pageContext.list?.id?.toString();
      const listTitle = this.context.pageContext.list?.title ?? "";
      console.log("[FormInstanceCommandSet] init", { listId, listTitle });
      if (!listId) {
        this.isInitialized = true;
        return;
      }
      const templateUsageConfigs = await ConfigListService.getConfigItemsByPrefix(sp.web, "TemplateUsage_");
      this.hasConfiguredTemplate = templateUsageConfigs.some((c) => (c.config || "").toLowerCase() === listTitle.toLowerCase());
      console.log("[FormInstanceCommandSet] templateUsage", {
        hasConfiguredTemplate: this.hasConfiguredTemplate,
        listTitle,
        count: templateUsageConfigs.length
      });
    } catch {
      this.hasConfiguredTemplate = false;
    } finally {
      this.isInitialized = true;
      this.updateCommandVisibility(this.lastHasSelection);
    }
  }

  private updateCommandVisibility(hasSelection: boolean): void {
    const newFormInstanceCommand: Command = this.tryGetCommand(CommandNames.COMMAND_NewFormInstance);
    const openFormCommand: Command = this.tryGetCommand(CommandNames.COMMAND_OpenFormInstance);
    const cancelFormCommand: Command = this.tryGetCommand(CommandNames.COMMAND_CancelFormInstance);

    const isFormTemplateList = this.context.pageContext.list?.title === ListNames.formTemplateListName;
    const allowed = this.isInitialized && this.hasConfiguredTemplate && !isFormTemplateList;
    console.log("[FormInstanceCommandSet] visibility", {
      isInitialized: this.isInitialized,
      hasConfiguredTemplate: this.hasConfiguredTemplate,
      isFormTemplateList,
      hasSelection,
      allowed
    });

    if (newFormInstanceCommand) {
      newFormInstanceCommand.visible = allowed;
    }
    if (openFormCommand) {
      openFormCommand.visible = allowed && hasSelection;
    }
    if (cancelFormCommand) {
      cancelFormCommand.visible = allowed && hasSelection;
    }
  }

  @override
  public async onInit(): Promise<void> {
    this.updateCommandVisibility(false);
    await this.initializeVisibilityState();

    if (this.panelPlaceHolder === undefined) {
      this.panelPlaceHolder = document.body.appendChild(document.createElement("div"));
      ReactDom.render(
        React.createElement(FormInstanceListActionsWrapper, {
          onClose: (): void => {
            closePanels();
          },
          componentContext: this.context as BaseComponentContext,
          spHttpClient: this.context.spHttpClient,
          httpClient: this.context.httpClient
        }),
        this.panelPlaceHolder
      );
    }

    return Promise.resolve();
  }

  @override
  public onListViewUpdated(event: IListViewCommandSetListViewUpdatedParameters): void {
    const hasSelection = event.selectedRows.length === 1;
    this.lastHasSelection = hasSelection;
    this.updateCommandVisibility(hasSelection);
  }

  @override
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    const source = encodeURIComponent(window.location.href);
    switch (event.itemId) {
      case "COMMAND_OpenFormInstance":
        sp.setup({
          spfxContext: {
            pageContext: this.context.pageContext
          }
        });
        const doRedirectToUrlWithFormIdentifier = async () => {
          const selectedItemId = event.selectedRows[0].getValueByName("ID");
          const listTitle = this.context.pageContext.list.title;
          const item = await sp.web.lists.getByTitle(listTitle).items.getById(selectedItemId).get();
          const formIdentifier = (item[ActiveListFieldNames.formInstanceIdentifier] as string) ?? item["FileLeafRef"];
          const formId = formIdentifier.replace(".json", "");
          const formInstanceParam = "&formInstanceId=" + encodeURIComponent(formId);
          const templateUsageConfigs = await ConfigListService.getConfigItemsByPrefix(sp.web, "TemplateUsage_");
          const match = templateUsageConfigs.find((c) => (c.config || "").toLowerCase() === listTitle.toLowerCase());
          const templateIdentifierParam = match ? "&templateIdentifier=" + encodeURIComponent(match.configName.replace(/^TemplateUsage_/, "")) : "";
          const urlForOpeningForm =
            this.context.pageContext.web.absoluteUrl + "/SitePages/FormInstance.aspx?openInPanel=1" + formInstanceParam + templateIdentifierParam + "&source=" + source;
          window.location.href = urlForOpeningForm;
        };
        doRedirectToUrlWithFormIdentifier();

        break;
      case "COMMAND_NewFormInstance":
        const redirectToNewForm = async () => {
          const listTitle = this.context.pageContext.list.title;
          const templateUsageConfigs = await ConfigListService.getConfigItemsByPrefix(sp.web, "TemplateUsage_");
          const match = templateUsageConfigs.find((c) => (c.config || "").toLowerCase() === listTitle.toLowerCase());
          const templateIdentifierParam = match ? "&templateIdentifier=" + encodeURIComponent(match.configName.replace(/^TemplateUsage_/, "")) : "";
          const url = this.context.pageContext.web.absoluteUrl + "/SitePages/FormInstance.aspx?openInPanel=1" + templateIdentifierParam + "&source=" + source;
          window.location.href = url;
        };
        redirectToNewForm();
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
