import { IFile, IFileInfo } from "@pnp/sp/files";
import { getAllInstanceListNames, getFormTemplateConfig, getInstanceListNameByVersionIdentifier, loadFormTemplate, loadFormTemplateByIdentifier } from "../formTemplates/services/FormTemplateService";
import { ErrorViewModel } from "../models/ErrorViewModel";
import { FormTemplate } from "../../extensions/common/models/FormTemplate";
import { ActiveListFieldNames, FormTemplateFieldNames, ListNames } from "../../extensions/formTemplateListActionsOnline/Constants";
import { ListItem } from "../listItem/ListItem";
import log, { error } from "loglevel";
import { sp } from "@pnp/sp";
import { createDefaultItem, loadFieldSchema } from "../listItem/helper/ListHelper";
import { FormViewModel } from "../../webparts/formInstanceOnline/models/FormViewModel";
import { FormTemplateConfig } from "../configListService/models/FormTemplateConfig";
import { ConfigListItem } from "../../extensions/common/models/ConfigListItem";
import {} from "../formTemplates/services/FormTemplateService";
import { FormListItem } from "../../webparts/formInstanceOnline/models/FormListItem";
import { mapObjectToListItem } from "../listItem/mapper/ObjectToListItemMapper";
import { ListItemToListItemFormUpdateValuesMapper } from "../components/formcomponents/mapper/ListItemToListItemFormUpdateValuesMapper";
import { mapListItemToObject } from "../listItem/mapper/ListItemToObjectMapper";

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

  public resolveInstanceListNameByVersion = async (versionIdentifier: string): Promise<string> => {
    return await this.getInstanceListNameByVersion(versionIdentifier);
  };

  public resolveInstanceListNameByItemId = async (itemId: number): Promise<string | undefined> => {
    return await this.findInstanceListNameByItemId(itemId);
  };

  public resolveAllInstanceListNames = async (): Promise<string[]> => {
    return await this.getAllInstanceListNames();
  };

  initializeFormViewModel = async (templateIdentifier: string | undefined): Promise<ErrorViewModel<FormViewModel>> => {
    const template = templateIdentifier === undefined ? await this.loadFormTemplate() : await this.loadFormTemplateByIdentifier(templateIdentifier);

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
    const contentTypeId = docSetCt.StringId;

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
              const isCreated = SP.DocumentSet.DocumentSet.create(ctx, folder, documentSetTitle, cTypeid);

              console.log("createDocSet: Created: ", isCreated);

              ctx.executeQueryAsync(
                (sender, args: any) => {
                  var createdDocSetUrl = args.$7_1.$1O_0["22"].m_value;
                  const siteUrl = window.location.origin;

                  // Serverrelative URL extrahieren
                  const relativeUrl = createdDocSetUrl.replace(siteUrl, "");

                  // Hole das zugehörige Listenelement des Document Sets
                  const folder = sp.web
                    .getFolderByServerRelativeUrl(relativeUrl)
                    .listItemAllFields()
                    .then((result) => {
                      resolve(result.Id);
                    })
                    .catch((ex) => {
                      log.error("document set could not be created", ex);
                      reject(ex);
                    });
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

  loadListItemFromArchive = async (idenfitier: string): Promise<string | undefined> => {
    const fileName = idenfitier + ".pdf";
    const viewXML =
      '<View Name="{1E26D021-1438-4090-AF4D-A0DB2B2CEF22}" Scope="Recursive" DefaultView="TRUE" MobileView="TRUE" MobileDefaultView="TRUE" Type="HTML" DisplayName="Alle Dokumente" Url="/efav2/Umsetzung IT-Maßnahme/Archiv/Forms/AllItems.aspx" Level="1" BaseViewID="1" ContentTypeID="0x" ImageUrl="/_layouts/15/images/dlicon.png?rev=43" ><Query><OrderBy><FieldRef Name="FileLeafRef" /></OrderBy> <Where> <Eq><FieldRef Name="FileLeafRef"/><Value Type="Text"><![CDATA[' +
      fileName +
      ']]></Value></Eq> </Where> </Query><ViewFields><FieldRef Name="DocIcon" /><FieldRef Name="LinkFilename" /><FieldRef Name="Modified" /><FieldRef Name="Editor" /><FieldRef Name="Beschreibung" /><FieldRef Name="Organisationseinheit" /><FieldRef Name="Auswahl_x0020_Ma_x00df_nahme" /></ViewFields><RowLimit Paged="TRUE">30</RowLimit><JSLink>clienttemplates.js</JSLink><XslLink Default="TRUE">main.xsl</XslLink><Toolbar Type="Standard"/></View>';
    const archiveFiles = await sp.web.lists.getByTitle(ListNames.formArchiveListName).renderListDataAsStream({ ViewXml: viewXML });
    if (archiveFiles.Row.length > 0) {
      return archiveFiles.Row[0].FileRef;
    }
    return undefined;
  };

  loadFormContent = async (fileName: string, remoteLogger: IServerLoggingContext, client: SPHttpClient): Promise<ErrorViewModel<FormViewModel>> => {
    try {
      let result = await this.loadListItemByFileName(fileName, client);

      if (result === undefined) {
        log.error("could not load listitem by filename", fileName);
        var logMessage: Logmodel = {
          text: "Das Formular konnte nicht gefunden werden. Es wurde gesucht nach " + fileName,
          type: "LoadForm"
        };
        remoteLogger.logCollectedLogsAsError(logMessage);
        return {
          model: undefined,
          error: "Formular konnte nicht geladen werden. Bitte melden Sie die CorrelationId dem Supportteam: " + remoteLogger.getCurrentCorrelationId()
        };
      }

      result.formContent.listItem.markFieldsAsNotChanged();

      const template = result.usedTemplateIdentifier === undefined ? await this.loadFormTemplate() : await this.loadFormTemplateByIdentifier(result.usedTemplateIdentifier);

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
    formTemplateIdentifier: string,
    formTemplateVersionIdentifier: string,
    remoteLogger: IServerLoggingContext
  ): Promise<ListItem> => {
    const currentWeb = await sp.web.get();

    const instanceListName = await this.getInstanceListNameByVersion(formTemplateVersionIdentifier);
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
    objectForJSON[formTemplateVersionIdentifierPropertyName] = formTemplateVersionIdentifier;
    objectForJSON[ActiveListFieldNames.formInstanceIdentifier] = fileNameToUse.replace(".json", "");
    const json = JSON.stringify(objectForJSON);
    const folderName = fileNameToUse.replace(".json", "");
    const folderItemId = await this.createDocumentset(currentWeb.Url, instanceListName, folderName);
    const folderPath = await sp.web.lists.getByTitle(instanceListName).items.getById(folderItemId).folder.serverRelativeUrl.get();
    var filteItemId = await this.uploadDocumentToDocumentSet(folderPath, folderName + ".json", json);
    const updateValues = ListItemToListItemFormUpdateValuesMapper.mapListItemToToFormUpdateValues(itemWithPropsInList, false, listSchema);
    updateValues.push({ FieldName: ActiveListFieldNames.formInstanceIdentifier, FieldValue: objectForJSON[ActiveListFieldNames.formInstanceIdentifier], HasException: false, ErrorMessage: "" });
    const addValidateResult = await sp.web.lists.getByTitle(instanceListName).items.getById(folderItemId).validateUpdateListItem(updateValues);
    var fieldsWithErrors = addValidateResult.filter((r) => r.ErrorMessage !== null && r.ErrorMessage !== undefined);
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

    const instanceListName = await this.getInstanceListNameByVersion(usedTemplateVersionIdentifier);
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

  private loadFormTemplate = async (): Promise<ErrorViewModel<FormTemplate | undefined>> => {
    let templateConfig: ConfigListItem<FormTemplateConfig> | undefined = undefined;

    try {
      templateConfig = await getFormTemplateConfig(sp.web);
    } catch (e) {
      log.error("could not load template due to error in config", e);
      return {
        error: "Formular kann nicht geladen werden",
        model: undefined
      };
    }
    if (templateConfig === undefined) {
      log.error("could not load template due to error in config");
      return {
        error: "Formular kann nicht geladen werden",
        model: undefined
      };
    }

    let template: ErrorViewModel<FormTemplate | undefined> = {
      error: undefined,
      model: undefined
    };

    try {
      template = await this.loadFormTemplateByIdentifier(templateConfig.config.templateIdentifierToUse);
      return template;
    } catch (e) {
      log.error("formTemplate konnte nicht geladen werden", e);
      return {
        error: "Vorlage kann nicht geladen werden",
        model: undefined
      };
    }
  };

  private loadFormTemplateByIdentifier = async (templateIdentifier: string): Promise<ErrorViewModel<FormTemplate>> => {
    return await loadFormTemplateByIdentifier(templateIdentifier);
  };

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

  private getInstanceListNameByVersion = async (versionIdentifier: string): Promise<string> => {
    return await getInstanceListNameByVersionIdentifier(versionIdentifier, sp.web);
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

  private loadListItemFromFile = async (file: IFile, client: SPHttpClient, instanceListName: string): Promise<FormListItem> => {
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
    var template = await this.loadFormTemplate();

    if (templateIdentifier === undefined) {
      templateIdentifier = template.model.templateIdenfitier;
    }
    if (templateVersionIdentifier === undefined) {
      templateVersionIdentifier = template.model.templateVersionIdentifier;
    }
    const defaultFormViewModel = await this.initializeFormViewModel(templateIdentifier);

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
      var schemaFieldsFromTemplate = template.model.editorModel.customFieldDefinitions.filter((f) => f.internalName == p.description.internalName);
      if (schemaFieldsFromTemplate.length > 0) {
        var schemaFieldFromTemplate = schemaFieldsFromTemplate[0];
        var isMirrored = template.model.editorModel.mirroredSPListFields.indexOf(schemaFieldFromTemplate.internalName) > -1;
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

  private loadListItemByFileName = async (identifier: string, client: SPHttpClient): Promise<FormListItem | undefined> => {
    const fileName = identifier + ".json";
    const viewXML =
      '<View Scope="Recursive"><Query><OrderBy><FieldRef Name="FileLeafRef" /></OrderBy> <Where> <Eq><FieldRef Name="FileLeafRef"/><Value Type="Text"><![CDATA[' +
      fileName +
      ']]></Value></Eq> </Where> </Query><ViewFields><FieldRef Name="DocIcon" /><FieldRef Name="LinkFilename" /></ViewFields><RowLimit Paged="TRUE">30</RowLimit><JSLink>clienttemplates.js</JSLink><XslLink Default="TRUE">main.xsl</XslLink><Toolbar Type="Standard"/></View>';

    const instanceLists = await this.getAllInstanceListNames();
    for (const listName of instanceLists) {
      try {
        const filesFromList = await sp.web.lists.getByTitle(listName).renderListDataAsStream({ ViewXml: viewXML });
        if (filesFromList.Row.length > 0) {
          const serverRelativeFileUrl = filesFromList.Row[0].FileRef;
          const file = sp.web.getFileByServerRelativeUrl(serverRelativeFileUrl);
          return await this.loadListItemFromFile(file, client, listName);
        }
      } catch (e) {
        log.debug("could not load forminstance in list", { error: e, listName: listName });
      }
    }
    return undefined;
  };
}
