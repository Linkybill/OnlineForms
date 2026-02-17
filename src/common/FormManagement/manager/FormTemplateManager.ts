import log from "loglevel";
import { IFormTemplateManager } from "../interfaces/IFormTemplateManager";
import { mapListItemToFormTemplateViewModel } from "../mapper/ListItemToFormTemplateViewModelMapper";
import { formTemplateAssignmentListName, formTemplateAttachmentName, formTemplateListName } from "../models/Constants";
import { FormTemplateAssignmentViewModel, FormTemplateViewModel } from "../models/FormTemplateViewModel";
import { sp } from "@pnp/sp";
import { IAttachments } from "@pnp/sp/attachments";
import { EditorModel } from "../../components/editor/models/EditorModel";
import { ErrorViewModel } from "../../models/ErrorViewModel";

export class FormTemplateManager implements IFormTemplateManager {
  loadUsedTemplate = async (
    contentTypeId: string,
    usage: "NewForm" | "EditForm" | "DisplayForm",
    formInstanceId: number | undefined,
    formWebId: string
  ): Promise<ErrorViewModel<FormTemplateAssignmentViewModel | undefined>> => {
    log.debug("FormManager, going to load used Templates with", {
      contentTypeId: contentTypeId,
      usage: usage,
      formInstanceId: formInstanceId,
      formWebId: formWebId
    });
    const assignedTemplate = formInstanceId === undefined ? await this.loadTemplateAssignmentByUsage(contentTypeId, usage, formWebId) : this.loadTemplateAssignmentByFormInstanceItemId(formInstanceId, formWebId);
    log.debug("FormManager: loaded template", assignedTemplate);
    return assignedTemplate;
  };

  private loadTemplateAssignmentByUsage = async (contentTypeId: string, usage: string, formWebId: string): Promise<ErrorViewModel<FormTemplateAssignmentViewModel | undefined>> => {
    const formTemplateWeb = (await sp.site.openWebById(formWebId)).web;

    const query =
      "<View><ViewFields><FieldRef Name='ID'/><FieldRef Name='Title'/><FieldRef Name='DemoFrmInst2Frm'/></ViewFields><Query><Where><And><Eq><FieldRef Name='DemoFrmUsage'/><Value Type='Text'>" +
      usage +
      "</Value></Eq><Eq><FieldRef Name='DemoFrmInst2Frm_x003a_DemoFrmCTId'/><Value Type='Lookup'>" +
      contentTypeId +
      "</Value></Eq></And></Where></Query></View>";

    log.debug("FormManager: going to request templateInstances with caml", query);
    const result = await formTemplateWeb.lists.getByTitle(formTemplateAssignmentListName).renderListDataAsStream({
      ViewXml: query,
      DatesInUtc: true
    });

    log.debug("FormManager: loaded templates", {
      result: result
    });

    if (result.Row.length > 0) {
      const formTemplateItemId = result.Row[0].DemoFrmInst2Frm[0].lookupId as number;
      const template = await this.loadTemplate(formTemplateItemId, formWebId);

      return {
        error: undefined,
        model: {
          assignmentListItemId: result.Row[0].ID,
          templateViewModel: template.model as FormTemplateViewModel
        }
      };
    } else {
      return {
        error: undefined,
        model: undefined
      };
    }
  };

  private loadTemplateAssignmentByFormInstanceItemId = async (formInstanceItemId: number, formWebId: string): Promise<ErrorViewModel<FormTemplateAssignmentViewModel | undefined>> => {
    const formTemplateWeb = (await sp.site.openWebById(formWebId)).web;

    const result = await formTemplateWeb.lists.getByTitle(formTemplateAssignmentListName).items.getById(formInstanceItemId).get();

    log.debug("FormManager: loaded templates", {
      result: result
    });

    const formTemplateItemId = result.DemoFrmInst2FrmId as number;
    const template = await this.loadTemplate(formTemplateItemId, formWebId);

    return {
      error: undefined,
      model: {
        assignmentListItemId: formInstanceItemId,
        templateViewModel: template.model as FormTemplateViewModel
      }
    };
  };

  loadTemplate = async (formTemplateListItemId: number, webId: string | undefined): Promise<ErrorViewModel<FormTemplateViewModel | undefined>> => {
    try {
      log.debug("FormTemplateManager: loadFormTemplate", formTemplateListItemId);

      const formWeb = webId !== undefined ? (await sp.site.openWebById(webId)).web : sp.web;
      const listItem = await formWeb.lists.getByTitle(formTemplateListName).items.getById(formTemplateListItemId).get();
      const templateToreturn: FormTemplateViewModel = mapListItemToFormTemplateViewModel(listItem);

      log.debug("FormTemplateManager: mapped listItemToTemplate: ", {
        listItem: listItem,
        template: templateToreturn
      });
      log.debug("loading attachments for formManagement", {
        formtemplateListName: formTemplateListName,
        itemId: formTemplateListItemId
      });
      const files = await formWeb.lists.getByTitle(formTemplateListName).items.getById(formTemplateListItemId).attachmentFiles.get();
      const attachments = files.filter((a) => a.FileName === formTemplateAttachmentName);
      if (attachments.length > 0) {
        const template = await formWeb.lists.getByTitle(formTemplateListName).items.getById(formTemplateListItemId).attachmentFiles.getByName(formTemplateAttachmentName).getJSON();
        templateToreturn.editorModel = template;
      }

      return {
        error: undefined,
        model: templateToreturn
      };
    } catch (e) {
      log.error("could not load FormTemplate", e);
      return {
        error: "could not load template",
        model: undefined
      };
    }
  };

  saveFormTemplate = async (editorModel: EditorModel, formTemplateListItemId: number): Promise<ErrorViewModel<{}>> => {
    try {
      const attachments = await sp.web.lists.getByTitle(formTemplateListName).items.getById(formTemplateListItemId).attachmentFiles.get();
      const templateAttachmentExists = attachments.filter((a) => a.FileName === formTemplateAttachmentName).length > 0;
      if (editorModel.componentConfig !== null) {
        if (templateAttachmentExists === true) {
          const result = await sp.web.lists.getByTitle(formTemplateListName).items.getById(formTemplateListItemId).attachmentFiles.getByName(formTemplateAttachmentName).setContent(JSON.stringify(editorModel));

          log.debug("FormTemplateManager: added / replaced attachment", result);
        } else {
          await sp.web.lists.getByTitle(formTemplateListName).items.getById(formTemplateListItemId).attachmentFiles.add(formTemplateAttachmentName, JSON.stringify(editorModel));
        }
      } else {
        if (templateAttachmentExists === true) await sp.web.lists.getByTitle(formTemplateListName).items.getById(formTemplateListItemId).attachmentFiles.getByName(formTemplateAttachmentName).delete();
      }
      return {
        error: undefined,
        model: {}
      };
    } catch (e) {
      log.error("Template konnte nicht bearbeitet werden", e);
      return {
        error: "Template konnte nicht bearbeitet werden",
        model: {}
      };
    }
  };
}
