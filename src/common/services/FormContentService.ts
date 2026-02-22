import { IFile, IFileInfo } from "@pnp/sp/files";
import { getAllInstanceListNames, getInstanceListNameByTemplateIdentifier, loadFormTemplateByIdentifier } from "../formTemplates/services/FormTemplateService";
import { ErrorViewModel } from "../models/ErrorViewModel";
import { FormTemplate } from "../../extensions/common/models/FormTemplate";
import { ActiveListFieldNames, ListNames } from "../../extensions/formTemplateListActionsOnline/Constants";
import { ListItem } from "../listItem/ListItem";
import log from "loglevel";
import { sp } from "@pnp/sp";
import "@pnp/sp/content-types";
import { createDefaultItem, loadFieldSchema } from "../listItem/helper/ListHelper";
import { FormViewModel } from "../../webparts/formInstanceOnline/models/FormViewModel";
import { } from "../formTemplates/services/FormTemplateService";
import { FormListItem } from "../../webparts/formInstanceOnline/models/FormListItem";
import { mapObjectToListItem } from "../listItem/mapper/ObjectToListItemMapper";
import { ListItemToListItemFormUpdateValuesMapper } from "../components/formcomponents/mapper/ListItemToListItemFormUpdateValuesMapper";
import { mapListItemToObject } from "../listItem/mapper/ListItemToObjectMapper";
import { FieldDescriptionTypes } from "../listItem/types/FieldDescriptionTypes";
import { FieldTypeNames } from "../listItem/FieldTypeNames";
import { ChoiceFieldDescription } from "../listItem/fields/choiceField/ChoiceFieldDescription";
import { ChoiceFieldFormatType, DateTimeFieldFormatType, FieldUserSelectionMode, UrlFieldFormatType } from "@pnp/sp/fields";
import { NumberFieldDescription } from "../listItem/fields/numberField/NumberFieldDescription";
import { CurrencyFieldDescription } from "../listItem/fields/currencyField/CurrencyFieldDescription";
import { DateTimeDisplayMode, DateTimeFieldDescription } from "../listItem/fields/dateTimeField/DateTimeFieldDescription";
import { UrlFieldDescription } from "../listItem/fields/urlField/UrlFieldDescription";
import { UserFieldDescription } from "../listItem/fields/userField/UserFieldDescription";
import { LookupFieldDescription } from "../listItem/fields/lookupField/LookupFieldDescription";
import { Guid } from "@microsoft/sp-core-library";

import { IListItemFormUpdateValue } from "@pnp/sp/lists";
import axios from "axios";
import { FileWithKey } from "../helper/FormFileContext";
import { IServerLoggingContext } from "../logging/ServerLoggingContext";
import { Logmodel } from "../logging/LogModel";
import { SPHttpClient } from "@microsoft/sp-http";
import { SharePointListItemsProvider } from "../components/listView/provider/SharePointListItemsProvider";
const formTemplateIdentifierPropertyName = "formTemplateIdentifier";
const formTemplateVersionIdentifierPropertyName = "formTemplateVersionIdentifier";
export class FormContentService {
  static documentSetContentTypeId = "0x0120D520";

  public resolveInstanceListNameByTemplateIdentifier = async (templateIdentifier: string): Promise<string> => {
    return await this.getInstanceListNameByTemplateIdentifier(templateIdentifier);
  };

  public resolveInstanceListNameByItemId = async (itemId: number): Promise<string | undefined> => {
    return await this.findInstanceListNameByItemId(itemId);
  };

  public resolveAllInstanceListNames = async (): Promise<string[]> => {
    return await this.getAllInstanceListNames();
  };

  initializeFormViewModel = async (templateIdentifier: string | undefined): Promise<ErrorViewModel<FormViewModel>> => {
    if (!templateIdentifier) {
      return {
        error: "TemplateIdentifier fehlt",
        model: undefined
      };
    }
    const template = await this.loadFormTemplateByIdentifier(templateIdentifier);

    if (template.error !== undefined || template.model === undefined) {
      return {
        error: "Vorlage kann nicht geladen werden",
        model: undefined
      };
    }
    let defaultItem = createDefaultItem(template.model.editorModel.customFieldDefinitions, undefined, []);
    return {
      error: undefined,
      model: {
        formTemplate: template.model,
        formContent: {
          etag: "-1",
          listItem: defaultItem
        }
      }
    };
  };

  createDocumentset = async (webUrl: string, libraryName: string, documentSetTitle: string): Promise<number> => {
    const cTypes = await sp.web.lists.getByTitle(libraryName).contentTypes.get();
    const docSetCt = cTypes.filter((ct) => ct.StringId.startsWith(FormContentService.documentSetContentTypeId))[0];
    if (!docSetCt) {
      log.error("CreateDocumentSet: can not create document set because no DocSet content type exists in list", libraryName);
      throw new Error("DocSet content type not found in list " + libraryName);
    }
    return this.createDocumentsetWithContentType(webUrl, libraryName, documentSetTitle, docSetCt.StringId);
  };

  private createDocumentsetWithContentType = async (webUrl: string, libraryName: string, documentSetTitle: string, contentTypeId: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      var ctx = new SP.ClientContext(webUrl);
      var web = ctx.get_web();
      var list = web.get_lists().getByTitle(libraryName);

      SP.SOD.executeFunc("sp.js", "SP.ClientContext", () => {
        log.debug("createDocSet: executed sp.js");
      });

      ctx.load(list);

      ctx.executeQueryAsync(
        function () {
          var folder = list.get_rootFolder();
          var docsetContentType = list.get_contentTypes().getById(contentTypeId);
          ctx.load(docsetContentType);
          ctx.load(folder);
          ctx.executeQueryAsync(
            () => {
              log.debug("createDocSet: Content-type: " + docsetContentType);
              const cTypeid = docsetContentType.get_id();
              const createdDocSet = SP.DocumentSet.DocumentSet.create(ctx, folder, documentSetTitle, cTypeid);

              console.log("createDocSet: Created: ", createdDocSet);

              // DocumentSet.create returns a StringResult (server-relative url)
              ctx.executeQueryAsync(
                async () => {
                  try {
                    const createdDocSetUrl = createdDocSet.get_value();
                    const siteUrl = window.location.origin;
                    const relativeUrl = createdDocSetUrl.replace(siteUrl, "");
                    const folderItem = await sp.web.getFolderByServerRelativeUrl(relativeUrl).listItemAllFields();
                    resolve(folderItem.Id);
                  } catch (ex) {
                    log.error("document set could not be created", ex);
                    reject(ex);
                  }
                },
                () => {
                  reject("could not create Documentset");
                }
              );
            },
            () => {
              reject("could not load folder or documentsetContentType");
            }
          );
        },
        () => {
          reject();
        }
      );
      ctx.add_requestSucceeded(function () {
        log.debug("createDocSet: succeded creating contenttype");
      });
      ctx.add_requestFailed(function (sender, args) {
        log.error("createDocSet: Request failed: " + args.get_message());
      });
    });
  };

  uploadDocumentToDocumentSet = async (serverRelativeFolderUrl: string, fileName: string, fileContent: any): Promise<number> => {
    try {
      const res = await sp.web.getFolderByServerRelativeUrl(serverRelativeFolderUrl).files.add(fileName, fileContent, true);
      var item = await (await res.file.getItem()).get();
      return item.ID;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  };

  createVersionAndTriggerWorkflow = async (itemId: number, comment: string, corelationId: string): Promise<void> => {
    const listName = await this.findInstanceListNameByItemId(itemId);
    if (!listName) {
      return;
    }
    const item = await sp.web.lists.getByTitle(listName).items.getById(itemId).get();
    if (item.ContentTypeId.startsWith(FormContentService.documentSetContentTypeId)) {
      const itemFolder = await sp.web.lists.getByTitle(listName).items.getById(itemId).folder.get();
      const web = await sp.web.get();
      await this.AddDocSetVersion(web.Url, itemFolder.ServerRelativeUrl, comment, corelationId);
    }
  };


  loadFormContent = async (
    formInstanceId: string,
    templateIdentifier: string | undefined,
    remoteLogger: IServerLoggingContext,
    client: SPHttpClient
  ): Promise<ErrorViewModel<FormViewModel>> => {
    try {
      let result = await this.loadListItemByFileName(formInstanceId, templateIdentifier, client);

      if (result === undefined) {
        log.error("could not load listitem by formInstanceId", formInstanceId);
        var logMessage: Logmodel = {
          text: "Das Formular konnte nicht gefunden werden. Es wurde gesucht nach " + formInstanceId,
          type: "LoadForm"
        };
        remoteLogger.logCollectedLogsAsError(logMessage);
        return {
          model: undefined,
          error: "Formular konnte nicht geladen werden. Bitte melden Sie die CorrelationId dem Supportteam: " + remoteLogger.getCurrentCorrelationId()
        };
      }

      result.formContent.listItem.markFieldsAsNotChanged();

      if (!result.usedTemplateIdentifier) {
        return {
          model: undefined,
          error: "TemplateIdentifier fehlt im Formular."
        };
      }
      const template = await this.loadFormTemplateByIdentifier(result.usedTemplateIdentifier);

      return {
        model: {
          formContent: result.formContent,
          formTemplate: template.model
        },
        error: undefined
      };
    } catch (e) {
      log.error("could not load listitem content", e);
      return {
        model: undefined,
        error: "Formular konnte nicht geladen werden."
      };
    }
  };

  addFormItem = async (
    formListItem: ListItem,
    filesToUpload: FileWithKey[],
    filenamesToDelete: string[],
    fileNameToUse: string,
    mirroredFieldNames: string[],
    fieldNamesWichShouldBeIgnoredInJSON: string[],
    fieldDefinitions: FieldDescriptionTypes[],
    formTemplateIdentifier: string,
    formTemplateVersionIdentifier: string,
    remoteLogger: IServerLoggingContext
  ): Promise<ListItem> => {
    const currentWeb = await sp.web.get();

    const instanceListName = await this.getInstanceListNameByTemplateIdentifier(formTemplateIdentifier);
    const templateResult = await this.loadFormTemplateByIdentifier(formTemplateIdentifier);
    if (templateResult.error || !templateResult.model) {
      throw new Error("Template konnte nicht geladen werden.");
    }
    const docSetContentTypeId = await this.getExistingDocumentSetContentTypeId(instanceListName);
    for (const fieldName of mirroredFieldNames) {
      const field = fieldDefinitions.find((f) => f.internalName === fieldName);
      if (field) {
        await this.ensureListFieldExists(instanceListName, field);
      }
    }
    const currentList = await sp.web.lists.getByTitle(instanceListName).expand("RootFolder").get();
    const listSchema = await loadFieldSchema(currentWeb.Id, currentList.Id, undefined);
    const itemWithPropsInList = new ListItem(formListItem.ID);
    const itemForJSON = new ListItem(formListItem.ID);
    formListItem.getProperties().forEach((prop) => {
      const indexForMatchingPropInSchema = listSchema.findIndex((schemaProp) => schemaProp.internalName === prop.description.internalName);
      const fieldShouldGetSavedInJSON = fieldNamesWichShouldBeIgnoredInJSON.indexOf(prop.description.internalName) === -1;
      const fieldIsMirrored = mirroredFieldNames.indexOf(prop.description.internalName) > -1;
      if (indexForMatchingPropInSchema > -1) {
        if (fieldIsMirrored) {
          itemWithPropsInList.addProperty(prop);
        }
      }
      if (fieldShouldGetSavedInJSON) {
        itemForJSON.addProperty(prop);
      }
    });
    const objectForJSON = mapListItemToObject(itemForJSON);
    objectForJSON[formTemplateIdentifierPropertyName] = formTemplateIdentifier;
    // version identifier is no longer used
    const formInstanceId = Guid.newGuid().toString();
    objectForJSON[ActiveListFieldNames.formInstanceIdentifier] = formInstanceId;
    const json = JSON.stringify(objectForJSON);
    const folderName = this.sanitizeListTitle(fileNameToUse || formInstanceId);
    const folderItemId = await this.createDocumentsetWithContentType(currentWeb.Url, instanceListName, folderName, docSetContentTypeId);
    const folderPath = await sp.web.lists.getByTitle(instanceListName).items.getById(folderItemId).folder.serverRelativeUrl.get();
    var filteItemId = await this.uploadDocumentToDocumentSet(folderPath, "data.json", json);
    const updateValues = ListItemToListItemFormUpdateValuesMapper.mapListItemToToFormUpdateValues(itemWithPropsInList, false, listSchema);
    updateValues.push({ FieldName: ActiveListFieldNames.formInstanceIdentifier, FieldValue: objectForJSON[ActiveListFieldNames.formInstanceIdentifier], HasException: false, ErrorMessage: "" });
    const addValidateResult = await sp.web.lists.getByTitle(instanceListName).items.getById(folderItemId).validateUpdateListItem(updateValues);
    var fieldsWithErrors = addValidateResult.filter((r) => r.HasException == true);
    if (fieldsWithErrors.length > 0) {
      const errors = fieldsWithErrors.map((f) => f.FieldName + ":" + f.ErrorMessage);
      var logModel: Logmodel = {
        text: "ListItem konnte nicht gespeichert werden",
        type: "SaveOrUpdate",
        listItemContext: formListItem,
        originalError: errors
      };
      remoteLogger.logTrace(logModel);
      log.error("FormItem konnte nicht gespeichert werden. ", logModel);
      throw new Error("FormItem konnte nicht gespeichert werden. Folgende Fehler sind aufgetreten: " + errors.join("    "));
    }
    await sp.web.lists.getByTitle(instanceListName).items.getById(filteItemId).validateUpdateListItem(updateValues);
    addValidateResult.forEach((prop) => {
      formListItem.setErrors(prop.FieldName as string, prop.ErrorMessage !== undefined && prop.ErrorMessage !== null && prop.ErrorMessage !== "" ? [prop.ErrorMessage] : []);
      // todo: setValues? I ddont set values here because I do not expect, that SharePoint changes Values on adding
      log.debug("setting exception in listitem", prop, itemWithPropsInList);
    });
    var allUploadPromises = filesToUpload.map((f) => {
      return this.uploadFiles(folderPath, f.key, [f.file]);
    });
    const allDeletes = filenamesToDelete.map((fileName) => {
      const serverRelativeFileUrl = folderPath + "/" + fileName;
      sp.web
        .getFileByServerRelativeUrl(serverRelativeFileUrl)
        .delete()
        .catch((error) => {
          var logModel: Logmodel = {
            text: "Fehler beim Löschen von Dateien.",
            type: "SaveOrUpdate",
            listItemContext: formListItem,
            originalError: error
          };
          remoteLogger.logTrace(logModel);
          log.error(`Fehler beim Löschen der Datei: ${serverRelativeFileUrl}`, error);
          throw error;
        });
    });
    try {
      await Promise.all([...allDeletes, ...allUploadPromises]);
    } catch (e) {
      var logModel: Logmodel = {
        text: "Dateien konnten nicht hochgeladen oder gelöscht werden.",
        type: "SaveOrUpdate",
        originalError: e
      };
      remoteLogger.logCollectedLogsAsError(logModel);
      throw e;
    }
    if (addValidateResult.length > 0) {
      const id = (addValidateResult[0] as any).ItemId;
      formListItem.ID = id;
    }

    return formListItem;
  };

  updateFormItem = async (
    formListItem: ListItem,
    filesToUpload: FileWithKey[],
    filenamesToDelete: string[],
    mirroredFieldNames: string[],
    fieldNamesWichShouldBeIgnoredInJSON: string[],
    usedTemplateIdentifier: string,
    usedTemplateVersionIdentifier: string,
    remoteLogger: IServerLoggingContext
  ): Promise<ListItem> => {
    const itemForJSON = new ListItem(formListItem.ID);
    const itemWithPropsFromSharePointOnly = new ListItem(formListItem.ID);

    const instanceListName = await this.getInstanceListNameByTemplateIdentifier(usedTemplateIdentifier);
    const resolvedActiveList = await sp.web.lists.getByTitle(instanceListName).expand("RootFolder").get();
    const resolvedWebRequest = await sp.web.get();

    const folderOrFileItem = await sp.web.lists
      .getByTitle(instanceListName)
      .items.getById(formListItem.ID)
      .select("Id", "Title", "LinkFilename", "Author/Id", "Author/Title", "Editor/Id", "Editor/Title", "ContentTypeId") // Add fields you need
      .expand("Author", "Editor") // Expanding fields like 'Author' and 'Editor'
      .get();
    const itemIdForMetadataUpdate = formListItem.ID;
    let file: IFileInfo = undefined;
    if (folderOrFileItem.ContentTypeId.startsWith(FormContentService.documentSetContentTypeId)) {
      const folder = await sp.web.lists.getByTitle(instanceListName).rootFolder.folders.getByName(folderOrFileItem.LinkFilename).get();
      const filesFromActiveList = await sp.web.getFolderByServerRelativeUrl(folder.ServerRelativeUrl).files.filter("substringof('.json', Name)").get();

      if (filesFromActiveList.length > 0) {
        file = filesFromActiveList[0];
      }

      const parentFolderForFileUpload = file.ServerRelativeUrl.replace("/" + file.Name, "");

      const allUploadPromises = filesToUpload.map((f) => {
        return this.uploadFiles(parentFolderForFileUpload, f.key, [f.file]);
      });

      const allDeletes = filenamesToDelete.map((fileName) => {
        const serverRelativeFileUrl = parentFolderForFileUpload + "/" + fileName;
        sp.web
          .getFileByServerRelativeUrl(serverRelativeFileUrl)
          .delete()
          .catch((error) => {
            log.error(`Fehler beim Löschen der Datei: ${serverRelativeFileUrl}`, error);
          });
      });
      await Promise.all([...allDeletes, ...allUploadPromises]);
    } else {
      file = await sp.web.lists.getByTitle(instanceListName).items.getById(formListItem.ID).file.get();
    }

    const parentFolderUrl = file.ServerRelativeUrl.replace("/" + file.Name, "");
    const activeListSchema = await loadFieldSchema(resolvedWebRequest.Id, resolvedActiveList.Id, undefined);
    formListItem.getProperties().forEach((prop) => {
      const fieldShouldBeSavedInJson = fieldNamesWichShouldBeIgnoredInJSON.indexOf(prop.description.internalName) === -1;
      if (fieldShouldBeSavedInJson === true) {
        itemForJSON.addProperty(prop);
      }
      if (prop.valueChanged === true) {
        const shemaFromSharePoint = activeListSchema.filter((schemaItem) => schemaItem.internalName === prop.description.internalName, activeListSchema);
        if (shemaFromSharePoint.length > 0) {
          const fieldIsMirrored = mirroredFieldNames.indexOf(prop.description.internalName) > -1;
          if (fieldIsMirrored === true) {
            itemWithPropsFromSharePointOnly.addProperty(prop);
          }
        }
      }
    });

    const updateValues = ListItemToListItemFormUpdateValuesMapper.mapListItemToToFormUpdateValues(itemWithPropsFromSharePointOnly, true);
    const objectForJSON = mapListItemToObject(itemForJSON);
    objectForJSON[formTemplateIdentifierPropertyName] = usedTemplateIdentifier;
    objectForJSON[formTemplateVersionIdentifierPropertyName] = usedTemplateVersionIdentifier;
    objectForJSON[ActiveListFieldNames.formInstanceIdentifier] = formListItem.getProperty(ActiveListFieldNames.formInstanceIdentifier)?.value ?? file.Name.replace(".json", "");
    const json = JSON.stringify(objectForJSON);

    const fileAddResult = await sp.web.getFolderByServerRelativeUrl(parentFolderUrl).files.add(file.Name, json, true);
    let result: IListItemFormUpdateValue[] = [];

    updateValues.push({
      FieldName: ActiveListFieldNames.formInstanceIdentifier,
      FieldValue: objectForJSON[ActiveListFieldNames.formInstanceIdentifier],
      HasException: false,
      ErrorMessage: ""
    });
    result = await sp.web.lists.getByTitle(instanceListName).items.getById(itemIdForMetadataUpdate).validateUpdateListItem(updateValues, false);
    result.forEach((prop) => {
      formListItem.setErrors(prop.FieldName as string, prop.ErrorMessage !== undefined && prop.ErrorMessage !== null && prop.ErrorMessage !== "" ? [prop.ErrorMessage] : []);
      // todo: setValues? I ddont set values here because I do not expect, that SharePoint changes Values on adding
    });

    const fieldsWithErrors = result.filter((r) => r.ErrorMessage !== null && r.ErrorMessage !== undefined);
    if (fieldsWithErrors.length > 0) {
      var logModel: Logmodel = {
        text: "Das Formularitem konnte nicht aktualisiert werden",
        type: "SaveOrUpdate",
        listItemContext: formListItem,
        originalError: fieldsWithErrors.map((f) => {
          return f.ErrorMessage;
        })
      };
      remoteLogger.logCollectedLogsAsError(logModel);
    }

    log.debug("updated filecontent", fileAddResult);
    log.debug("updated sharePointProps in active list", result);
    return formListItem;
  };

  private loadFormTemplateByIdentifier = async (templateIdentifier: string): Promise<ErrorViewModel<FormTemplate>> => {
    return await loadFormTemplateByIdentifier(templateIdentifier);
  };

  private sanitizeListTitle = (title: string): string => {
    const cleaned = (title || "").replace(/[\"#%*<>?\/\\{|}]/g, "").trim();
    if (cleaned.length === 0) {
      return "FormInstances";
    }
    return cleaned.substring(0, 255);
  };

  private async getExistingDocumentSetContentTypeId(listName: string): Promise<string> {
    const listCts = await sp.web.lists.getByTitle(listName).contentTypes.get();
    const docSetCt = listCts.find((ct) => ct.StringId?.startsWith(FormContentService.documentSetContentTypeId));
    if (!docSetCt) {
      throw new Error("DocSet content type not found in list " + listName);
    }
    return docSetCt.StringId;
  }

  private async ensureListFieldExists(listName: string, field: FieldDescriptionTypes): Promise<void> {
    const fields = await sp.web.lists.getByTitle(listName).fields.filter(`InternalName eq '${field.internalName}'`).get();
    if (fields.length > 0) {
      return;
    }
    const list = sp.web.lists.getByTitle(listName);
    const baseProperties = {
      Group: "angehobene Formularfelder",
      Description: field.description ?? "",
      Required: field.required === true
    };
    switch (field.type) {
      case FieldTypeNames.Text: {
        await list.fields.addText(field.internalName, undefined, baseProperties);
        break;
      }
      case FieldTypeNames.Note: {
        await list.fields.addMultilineText(field.internalName, undefined, true, false, false, true, baseProperties);
        break;
      }
      case FieldTypeNames.Boolean: {
        await list.fields.addBoolean(field.internalName, baseProperties);
        break;
      }
      case FieldTypeNames.Number: {
        const numberField = field as NumberFieldDescription;
        await list.fields.addNumber(field.internalName, undefined, undefined, baseProperties);
        if (numberField.numberOfDecimals !== undefined) {
          await list.fields.getByInternalNameOrTitle(field.internalName).update({ Decimals: numberField.numberOfDecimals });
        }
        break;
      }
      case FieldTypeNames.Currency: {
        const currencyField = field as CurrencyFieldDescription;
        await list.fields.addCurrency(field.internalName, undefined, undefined, currencyField.currencyLocaleId, baseProperties);
        if (currencyField.numberOfDecimals !== undefined) {
          await list.fields.getByInternalNameOrTitle(field.internalName).update({ Decimals: currencyField.numberOfDecimals });
        }
        break;
      }
      case FieldTypeNames.DateTime: {
        const dateField = field as DateTimeFieldDescription;
        const format = dateField.displayMode === DateTimeDisplayMode.DateAndTime ? DateTimeFieldFormatType.DateTime : DateTimeFieldFormatType.DateOnly;
        await list.fields.addDateTime(field.internalName, format, undefined, undefined, baseProperties);
        break;
      }
      case FieldTypeNames.Choice: {
        const choiceField = field as ChoiceFieldDescription;
        const format = choiceField.representation === "Checkbox / Radio" ? ChoiceFieldFormatType.RadioButtons : ChoiceFieldFormatType.Dropdown;
        await list.fields.addChoice(field.internalName, choiceField.choices ?? [], format, choiceField.fillInChoiceEnabled === true, baseProperties);
        break;
      }
      case FieldTypeNames.MultiChoice: {
        const choiceField = field as ChoiceFieldDescription;
        await list.fields.addMultiChoice(field.internalName, choiceField.choices ?? [], choiceField.fillInChoiceEnabled === true, baseProperties);
        break;
      }
      case FieldTypeNames.URL: {
        const urlField = field as UrlFieldDescription;
        const format = urlField.isImageUrl === true ? UrlFieldFormatType.Image : UrlFieldFormatType.Hyperlink;
        await list.fields.addUrl(field.internalName, format, baseProperties);
        break;
      }
      case FieldTypeNames.User:
      case FieldTypeNames.UserMulti: {
        const userField = field as UserFieldDescription;
        const mode = userField.allowGroupSelection === true ? FieldUserSelectionMode.PeopleAndGroups : FieldUserSelectionMode.PeopleOnly;
        await list.fields.addUser(field.internalName, mode, baseProperties);
        if (userField.canSelectMultipleItems === true || field.type === FieldTypeNames.UserMulti) {
          await list.fields.getByInternalNameOrTitle(field.internalName).update({ AllowMultipleValues: true });
        }
        if (userField.groupId !== undefined) {
          await list.fields.getByInternalNameOrTitle(field.internalName).update({ SelectionGroup: userField.groupId });
        }
        break;
      }
      case FieldTypeNames.Lookup:
      case FieldTypeNames.LookupMulti: {
        const lookupField = field as LookupFieldDescription;
        await list.fields.addLookup(field.internalName, lookupField.lookupListId, lookupField.lookupField, baseProperties);
        if (lookupField.canSelectMultipleItems === true || field.type === FieldTypeNames.LookupMulti) {
          await list.fields.getByInternalNameOrTitle(field.internalName).update({ AllowMultipleValues: true });
        }
        break;
      }
      default: {
        log.warn("Field is not supported for auto-creation in SharePoint", field.type);
      }
    }
    if (field.displayName && field.displayName !== field.internalName) {
      await list.fields.getByInternalNameOrTitle(field.internalName).update({ Title: field.displayName });
    }
  }

  AddDocSetVersion = async (webUrl: string, folderUrl: string, comments: string, correlationIdForRequest: string) => {
    const serviceUrl = window.location.origin + "/_vti_bin/SAPOMRESTDataService.svc/CaptureDocumentSetVersion";

    const instance = axios.create({
      withCredentials: true,
      baseURL: serviceUrl, // Basis-URL des Services
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Correlation-Id": correlationIdForRequest
      }
    });

    // Senden Sie die POST-Anfrage mit den Parametern und dem Daten-Body
    const response = await instance.post(
      serviceUrl,
      { comments: comments },
      {
        params: { webUrl: webUrl, folderUrl: folderUrl },
        paramsSerializer: { indexes: true }
      }
    );

    console.log("Response:", response.data);
  };

  private uploadFiles = async (folderPath: string, key: string, files: File[]): Promise<void> => {
    try {
      // Iterate over the selected files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Read the file content
        const arrayBuffer = await file.arrayBuffer();

        // Upload the file to the specified folder
        var fileAddResult = await sp.web.getFolderByServerRelativeUrl(folderPath).files.add(file.name, arrayBuffer, true);
        const item = await fileAddResult.file.getItem();

        // Update the specified field with the provided value
        await item.update({});
      }

      console.log("Files successfully uploaded");
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  private getInstanceListNameByTemplateIdentifier = async (templateIdentifier: string): Promise<string> => {
    return await getInstanceListNameByTemplateIdentifier(templateIdentifier, sp.web);
  };

  private getAllInstanceListNames = async (): Promise<string[]> => {
    return await getAllInstanceListNames(sp.web);
  };

  private findInstanceListNameByItemId = async (itemId: number): Promise<string | undefined> => {
    const instanceLists = await this.getAllInstanceListNames();
    for (const listName of instanceLists) {
      try {
        await sp.web.lists.getByTitle(listName).items.getById(itemId).select("Id").get();
        return listName;
      } catch {
        // ignore
      }
    }
    return undefined;
  };

  private loadListItemFromFile = async (file: IFile, client: SPHttpClient, instanceListName: string): Promise<FormListItem | undefined> => {
    const fileContent = await file.getJSON();
    const resolvedFile = await file.get();
    let item = await (await file.getItem()).select("FileRef", "FileDirRef", "FileSystemObjectType", "Folder/ServerRelativeUrl", "ID").expand("Folder").get();

    const fileUrl: string = resolvedFile.ServerRelativeUrl;
    const fileUrlSplittedBySlashes = fileUrl.split("/");
    const fileName = fileUrlSplittedBySlashes[fileUrlSplittedBySlashes.length - 1];
    const currentFolderUrl = item.FileDirRef;

    const currentFolderSplittedBySlash = currentFolderUrl.split("/");
    const lastPartOfCurrentFolder = currentFolderSplittedBySlash[currentFolderSplittedBySlash.length - 1];
    if (lastPartOfCurrentFolder.toLowerCase() !== instanceListName.toLowerCase()) {
      const serverRelativeFolderUrl = resolvedFile.ServerRelativeUrl.replace("/" + fileName, "");
      item = await (await sp.web.getFolderByServerRelativeUrl(serverRelativeFolderUrl).getItem()).get();
    }

    var templateIdentifier = fileContent[formTemplateIdentifierPropertyName];
    var templateVersionIdentifier = fileContent[formTemplateVersionIdentifierPropertyName];
    if (templateIdentifier === undefined) {
      return undefined;
    }
    if (templateVersionIdentifier === undefined) {
      templateVersionIdentifier = "";
    }
    const defaultFormViewModel = await this.initializeFormViewModel(templateIdentifier);
    if (defaultFormViewModel.error || !defaultFormViewModel.model) {
      log.error("could not initialize form view model", defaultFormViewModel.error);
      return undefined;
    }

    let mergedListItem: ListItem = new ListItem(item.ID);
    log.debug("loading listitem with filecontent", fileContent);

    const propObject = fileContent;
    const keys = Object.keys(propObject);
    const lisItemFromJSON = mapObjectToListItem(defaultFormViewModel.model.formTemplate.editorModel.customFieldDefinitions, propObject);
    keys.forEach(() => {
      mergedListItem.addProperties(lisItemFromJSON.getProperties());
    });

    // ensure fields from template model
    mergedListItem.addProperties(defaultFormViewModel.model.formContent.listItem.getProperties());

    // ensure values from sharePoint Actie List
    var web = await sp.web.get();
    var defaultViewFromActiveList = await sp.web.lists.getByTitle(instanceListName).defaultView.get();
    const provider = new SharePointListItemsProvider(web.Url, instanceListName, defaultViewFromActiveList.Title);
    var activeFormItem = await provider.loadListItem(item.ID);
    activeFormItem.getProperties().forEach((p) => {
      var schemaFieldsFromTemplate = defaultFormViewModel.model.formTemplate.editorModel.customFieldDefinitions.filter((f) => f.internalName == p.description.internalName);
      if (schemaFieldsFromTemplate.length > 0) {
        var schemaFieldFromTemplate = schemaFieldsFromTemplate[0];
        var isMirrored = defaultFormViewModel.model.formTemplate.editorModel.mirroredSPListFields.indexOf(schemaFieldFromTemplate.internalName) > -1;
        if (isMirrored == false) {
          mergedListItem.setValue(schemaFieldFromTemplate.internalName, activeFormItem.getProperty(schemaFieldFromTemplate.internalName).value);
        }
      }
    });

    return {
      usedTemplateIdentifier: fileContent[formTemplateIdentifierPropertyName],
      itemId: item.ID,
      formContent: {
        etag: item["odata.etag"],
        listItem: mergedListItem
      }
    };
  };

  private loadListItemByFileName = async (identifier: string, templateIdentifier: string | undefined, client: SPHttpClient): Promise<FormListItem | undefined> => {
    const viewXML =
      '<View Scope="Recursive"><Query><OrderBy><FieldRef Name="ID" /></OrderBy> <Where> <Eq><FieldRef Name="' +
      ActiveListFieldNames.formInstanceIdentifier +
      '"/><Value Type="Text"><![CDATA[' +
      identifier +
      ']]></Value></Eq> </Where> </Query><ViewFields><FieldRef Name="ID" /><FieldRef Name="ContentTypeId" /><FieldRef Name="FileRef" /><FieldRef Name="FileDirRef" /><FieldRef Name="LinkFilename" /></ViewFields><RowLimit Paged="TRUE">30</RowLimit><JSLink>clienttemplates.js</JSLink><XslLink Default="TRUE">main.xsl</XslLink><Toolbar Type="Standard"/></View>';

    const instanceLists = templateIdentifier
      ? [await this.getInstanceListNameByTemplateIdentifier(templateIdentifier)]
      : await this.getAllInstanceListNames();
    for (const listName of instanceLists) {
      try {
        const itemsFromList = await sp.web.lists.getByTitle(listName).renderListDataAsStream({ ViewXml: viewXML });
        if (itemsFromList.Row.length > 0) {
          const itemId = itemsFromList.Row[0].ID;
          const item = await sp.web.lists
            .getByTitle(listName)
            .items.getById(itemId)
            .select("Id", "ContentTypeId", "FileRef", "FileDirRef", "LinkFilename", "Folder/ServerRelativeUrl")
            .expand("Folder")
            .get();

          if (item.ContentTypeId && item.ContentTypeId.startsWith(FormContentService.documentSetContentTypeId)) {
            const folderUrl = item.Folder?.ServerRelativeUrl ?? item.FileRef;
            const files = await sp.web.getFolderByServerRelativeUrl(folderUrl).files.filter("substringof('.json', Name)").get();
            const dataFile = files.find((f) => f.Name?.toLowerCase() === "data.json") ?? files[0];
            if (!dataFile) {
              return undefined;
            }
            const file = sp.web.getFileByServerRelativeUrl(dataFile.ServerRelativeUrl);
            return await this.loadListItemFromFile(file, client, listName);
          } else {
            const file = sp.web.getFileByServerRelativeUrl(item.FileRef);
            return await this.loadListItemFromFile(file, client, listName);
          }
        }
      } catch (e) {
        log.debug("could not load forminstance in list", { error: e, listName: listName });
      }
    }
    return undefined;
  };
}
