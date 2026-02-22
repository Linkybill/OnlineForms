import { Guid } from "@microsoft/sp-core-library";
import { EditorModel } from "../../components/editor/models/EditorModel";
import { FormTemplate } from "../../../extensions/common/models/FormTemplate";
import { sp } from "@pnp/sp";
import { IWeb, IWebInfo } from "@pnp/sp/webs";
import { ActiveListFieldNames, FormTemplateFieldNames, ListNames } from "../../../extensions/formTemplateListActionsOnline/Constants";
import { ErrorViewModel } from "../../models/ErrorViewModel";
import log from "loglevel";
import { FormTemplateConfig } from "../../configListService/models/FormTemplateConfig";
import "@pnp/sp";
import "@pnp/sp/fields";
import { IList } from "@pnp/sp/lists";
import { ConfigListItem } from "../../../extensions/common/models/ConfigListItem";
import { ConfigListService } from "../../configListService/ConfigListService";
import { createDefaultJSOnOrLoadBaseTemplateJSon } from "../../../extensions/common/models/DefaultEditorModel";
import { FormTemplateUpdateResult } from "./TemplateUpdateResult";
// Removed external web provisioning; templates are created in current web

const featureIdWhichNeedsToGetActivatedInFormSubWebs = "1fbb5a1f-3ec3-45cf-a5d5-741cce28db2f";
const docSetFeatureId = "3bae86a2-776d-499d-9db8-fa4cdc7884f8";
const templateUsagePrefix = "TemplateUsage_";
const docSetContentTypeId = "0x0120D520";

export const addFormTemplate = async (
  title: string,
  description: string,
  validFrom: Date,
  validUntil: Date,
  templateIdentifier: string,
  versionIdentifier: string,
  editorModel: EditorModel
): Promise<ErrorViewModel<FormTemplate>> => {
  const template: FormTemplate = {
    currentETag: "1",
    description: description,
    templateIdenfitier: templateIdentifier,
    templateVersionIdentifier: versionIdentifier,
    title: title,
    validFrom: validFrom,
    validUntil: validUntil,
    editorModel: editorModel
  };

  try {
    const newFileName = Guid.newGuid().toString();
    const folder = sp.web.lists.getByTitle(ListNames.formTemplateListName).rootFolder;
    const result = await folder.files.add(newFileName, JSON.stringify(editorModel));

    const item = await result.file.getItem();
    await item.update({
      ["Title"]: template.title,
      [FormTemplateFieldNames.templateIdentifier]: template.templateIdenfitier,
      [FormTemplateFieldNames.templateVersionIdentifier]: template.templateVersionIdentifier,
      [FormTemplateFieldNames.templateDescription]: template.description,
      [FormTemplateFieldNames.templateFieldNameGueltigBis]: template.validUntil,
      [FormTemplateFieldNames.templateFieldNameGueltigVon]: template.validFrom
    });

    // ensure instance library + docset content type + config mapping
    const listTitle = await ensureInstanceLibraryForTemplate(template.title, template.templateVersionIdentifier);
    await ensureDocSetContentTypeOnList(listTitle, template.title, template.templateIdenfitier);
    await upsertTemplateUsageConfig(template.templateIdenfitier, listTitle, sp.web);

    return Promise.resolve({ error: undefined, model: { ...template, id: -1 } });
  } catch (e) {
    log.error("Error while adding a new formtemplate: ", e);
    return {
      error: "Template konnte nicht angelegt werden",
      model: template
    };
  }
};

export const upsertTemplateUsageConfig = async (templateIdentifier: string, listTitle: string, web: IWeb): Promise<ConfigListItem<string>> => {
  return ConfigListService.upsertConfigString(web, templateUsagePrefix + templateIdentifier, listTitle);
};

export const getInstanceListNameByTemplateIdentifier = async (templateIdentifier: string, web: IWeb): Promise<string> => {
  const config = await ConfigListService.getConfigString(web, templateUsagePrefix + templateIdentifier);
  if (!config || !config.config) {
    throw new Error("Keine Instanzliste für Template gefunden: " + templateIdentifier);
  }
  return config.config;
};

export const getAllInstanceListNames = async (web: IWeb): Promise<string[]> => {
  const configs = await ConfigListService.getConfigStringsByPrefix(web, templateUsagePrefix);
  const names = configs.map((c) => c.config).filter((v) => v !== undefined && v !== null && v !== "");
  return Array.from(new Set(names));
};

export const addNewTemplateWithNewWeb = async (
  title: string,
  description: string,
  validFrom: Date,
  validUntil: Date,
  templateIdentifier: string,
  versionIdentifier: string,
  baseTemplateItemId: number | undefined
): Promise<ErrorViewModel<FormTemplate>> => {
  const template: FormTemplate = {
    currentETag: "1",
    description: description,
    validFrom: validFrom,
    validUntil: validUntil,
    templateIdenfitier: templateIdentifier,
    templateVersionIdentifier: versionIdentifier,
    title: title
  };

  const defaultTemplate = await createDefaultJSOnOrLoadBaseTemplateJSon(baseTemplateItemId);
  const newTemplate = await addFormTemplate(template.title, template.description, template.validFrom, template.validUntil, template.templateIdenfitier, template.templateVersionIdentifier, defaultTemplate);
  log.debug("created new template", newTemplate);
  if (newTemplate.error !== undefined) {
    return newTemplate;
  }

  log.debug("added new web for template", newTemplate);
  return Promise.resolve(newTemplate);
};

export const loadFormTemplate = async (templateItemId: number): Promise<ErrorViewModel<FormTemplate>> => {
  try {
    const item = await sp.web.lists.getByTitle(ListNames.formTemplateListName).items.getById(templateItemId).get();
    log.debug("loaded item without expand", item);
    const template = await sp.web.lists.getByTitle(ListNames.formTemplateListName).items.getById(templateItemId).file.getJSON();
    log.debug("loadFormTemplate, loaded listitem", template, item);
    return {
      error: undefined,
      model: {
        currentETag: item["odata.etag"],
        id: item.ID,
        description: item[FormTemplateFieldNames.templateDescription],
        templateIdenfitier: item[FormTemplateFieldNames.templateIdentifier],
        title: item["Title"],
        validFrom: item[FormTemplateFieldNames.templateFieldNameGueltigVon],
        validUntil: item[FormTemplateFieldNames.templateFieldNameGueltigBis],
        templateVersionIdentifier: item[FormTemplateFieldNames.templateVersionIdentifier],
        editorModel: template
      }
    };
  } catch (e) {
    return {
      error: "Fehler beim laden des Templates mit id " + templateItemId,
      model: {
        currentETag: "",
        templateIdenfitier: "",
        description: "",
        templateVersionIdentifier: "",
        title: "",
        validFrom: new Date(),
        validUntil: new Date()
      }
    };
  }
};

export const loadFormTemplateByIdentifier = async (templateIdentifier: string): Promise<ErrorViewModel<FormTemplate>> => {
  const now = new Date().toISOString();
  const formTemplates = await sp.web.lists
    .getByTitle(ListNames.formTemplateListName)
    .items.filter(
      FormTemplateFieldNames.templateIdentifier +
      " eq '" +
      templateIdentifier +
      "' and ( (" +
      FormTemplateFieldNames.templateFieldNameGueltigVon +
      " lt '" +
      now +
      "' and " +
      FormTemplateFieldNames.templateFieldNameGueltigBis +
      " gt '" +
      now +
      "') or (   " +
      FormTemplateFieldNames.templateFieldNameGueltigVon +
      " lt '" +
      now +
      "' and " +
      FormTemplateFieldNames.templateFieldNameGueltigBis +
      " eq null  ) )"
    )
    .get();

  if (formTemplates.length > 0) {
    const templateItemId = formTemplates[0].ID;
    return await loadFormTemplate(templateItemId);
  }
  return {
    error: "template nicht gefunden",
    model: undefined
  };
};


export const updateTemplate = async (templateItemId: number, editorModel: EditorModel, context: any, currentETag: string): Promise<ErrorViewModel<FormTemplateUpdateResult | undefined>> => {
  try {
    try {
      await sp.site.rootWeb.lists.getByTitle(ListNames.formTemplateListName).items.getById(templateItemId).update({}, currentETag);
    } catch (e) {
      return {
        error: "Das Template hat sich geändert, bitte neu Laden",
        model: undefined
      };
    }

    /*sp.setup({
      sp: {
        headers: {
          "IF-MATCH": "test"
        }
      },
      spfxContext: {
        pageContext: context.pageContext

        //aadTokenProviderFactory: context.aadTokenProviderFactory,
        //msGraphClientFactory: context.msGraphClientFactory.getClient as any, // todo: check graph integration?
      }
    });*/

    var resolvedTemplateList = await sp.site.rootWeb.lists.getByTitle(ListNames.formTemplateListName).expand("RootFolder").get();
    var file = await sp.site.rootWeb.lists.getByTitle(ListNames.formTemplateListName).items.getById(templateItemId).file.get();
    const fileAddResult = await sp.site.rootWeb.getFolderByServerRelativeUrl(resolvedTemplateList.RootFolder.ServerRelativeUrl).files.add(file.Name, JSON.stringify(editorModel), true);
    const newEtagFromResponse = '"' + fileAddResult.data.ETag.split(",")[1];
    return {
      error: undefined,
      model: {
        currentETag: newEtagFromResponse
      }
    };
  } catch (e) {
    log.error(e);
    return {
      error: "Fehler beim speichern des Templates " + templateItemId,
      model: undefined
    };
  }
};

export const addNewTemplateAndConfigureExistingWeb = async (
  formTemplateTitle: string,
  description: string,
  validFrom: Date,
  validUntil: Date,
  templateIdentifier: string,
  versionIdentifier: string,
  webId: string,
  baseTemplateItemId: number | undefined
): Promise<ErrorViewModel<FormTemplate>> => {
  const defaultEditorModel = await createDefaultJSOnOrLoadBaseTemplateJSon(baseTemplateItemId);
  const template = await addFormTemplate(formTemplateTitle, description, validFrom, validUntil, templateIdentifier, versionIdentifier, defaultEditorModel);

  return template;
};

export const createNewVersionOfTemplate = async (templateItemId: number): Promise<ErrorViewModel<number>> => {
  const template = await loadFormTemplate(templateItemId);
  if (template.error !== undefined) {
    log.error(template.error);
    return Promise.resolve({
      error: template.error,
      model: -1
    });
  }

  log.debug("createNewVersion for template", template);
  const newTemplateVersion = Guid.newGuid();
  const result = await addFormTemplate(
    template.model.title,
    template.model.description,
    template.model.validFrom,
    template.model.validUntil,
    template.model.templateIdenfitier,
    newTemplateVersion.toString(),
    template.model.editorModel
  );
  return Promise.resolve({
    error: result.error,
    model: result.model.id
  });
};

const ensureConfigList = async (web: IWeb) => {
  const configLigList = await web.lists.filter("Title eq '" + ListNames.configListName + "'").get();
  if (configLigList.length === 0) {
    await web.features.add(featureIdWhichNeedsToGetActivatedInFormSubWebs);
  }
};

const ensureTemplateConfigInWeb = async (web: IWeb, templateIdentifier: string): Promise<void> => {
  const existingConfig: ConfigListItem<FormTemplateConfig> | undefined = await getFormTemplateConfig(web);
  const configToEnsure: FormTemplateConfig = {
    templateIdentifierToUse: templateIdentifier
  };
  if (existingConfig === undefined) {
    await ConfigListService.addConfig<FormTemplateConfig>(web, ConfigListService.formTemplateConfigName, configToEnsure);
  } else {
    await ConfigListService.overwriteConfig<FormTemplateConfig>(web, configToEnsure, existingConfig.itemId);
  }
};

const ensureInstanceLibraryForTemplate = async (templateTitle: string, versionIdentifier: string): Promise<string> => {
  await sp.site.features.add(docSetFeatureId, true);

  const baseListTitle = sanitizeListTitle(templateTitle);
  let listTitle = baseListTitle;
  const existingList = await sp.web.lists.filter("Title eq '" + listTitle + "'").get();
  if (existingList.length > 0) {
    const suffix = versionIdentifier.replace(/[^a-zA-Z0-9]/g, "").substring(0, 8);
    listTitle = (baseListTitle + "_" + suffix).substring(0, 255);
  }

  let list = await sp.web.lists.filter("Title eq '" + listTitle + "'").get();
  if (list.length === 0) {
    await sp.web.lists.add(listTitle, "", 101, false);
  }

  const listRef = sp.web.lists.getByTitle(listTitle);
  await listRef.update({ ContentTypesEnabled: true });
  await ensureFormInstanceIdentifierField(listRef);

  const baseDocSetCtName = sanitizeListTitle(templateTitle);
  const existingCts = await sp.web.contentTypes.filter("Name eq '" + baseDocSetCtName + "'").get();
  const existingDocSetCt = existingCts.find((ct) => ct.Id?.StringValue?.startsWith(docSetContentTypeId));
  let ctId: string | undefined = existingDocSetCt ? existingDocSetCt.Id.StringValue : undefined;

  let docSetCtName = baseDocSetCtName;
  if (!ctId && existingCts.length > 0) {
    const suffix = templateTitle.replace(/[^a-zA-Z0-9]/g, "").substring(0, 8);
    docSetCtName = sanitizeListTitle(`${baseDocSetCtName}_${suffix || "DocSet"}`);
  }

  if (!ctId) {
    await createCType((await sp.web.get()).Url, docSetContentTypeId, docSetCtName, "Form instances for " + templateTitle, "OnlineForms");
    const created = await sp.web.contentTypes.filter("Name eq '" + docSetCtName.replace(/'/g, "''") + "'").get();
    ctId = created.length > 0 ? created[0].Id.StringValue : undefined;
  }
  if (!ctId || !ctId.startsWith(docSetContentTypeId)) {
    throw new Error("Created content type is not a Document Set. CT Id: " + (ctId ?? "undefined"));
  }

  await listRef.contentTypes.addAvailableContentType(ctId);

  return listTitle;
};

const ensureDocSetContentTypeOnList = async (listTitle: string, templateTitle: string, templateIdentifier: string): Promise<void> => {
  await sp.site.features.add(docSetFeatureId, true);
  const listRef = sp.web.lists.getByTitle(listTitle);
  await listRef.update({ ContentTypesEnabled: true });
  await ensureFormInstanceIdentifierField(listRef);

  const baseCtName = sanitizeListTitle(templateTitle) || `FormInstances_${templateIdentifier}`;
  const escapedCtName = baseCtName.replace(/'/g, "''");
  const existingCts = await sp.web.contentTypes.filter("Name eq '" + escapedCtName + "'").get();
  const existingDocSet = existingCts.find((ct) => ct.Id?.StringValue?.startsWith(docSetContentTypeId));

  let ctName = baseCtName;
  let ctId: string | undefined = existingDocSet ? existingDocSet.Id.StringValue : undefined;

  if (!ctId && existingCts.length > 0) {
    const suffix = (templateIdentifier || "").replace(/[^a-zA-Z0-9]/g, "").substring(0, 8);
    ctName = sanitizeListTitle(`${baseCtName}_${suffix || "DocSet"}`);
  }

  if (!ctId) {
    await createCType((await sp.web.get()).Url, docSetContentTypeId, ctName, "Form instances for " + templateTitle, "OnlineForms");
    const created = await sp.web.contentTypes.filter("Name eq '" + ctName.replace(/'/g, "''") + "'").get();
    ctId = created.length > 0 ? created[0].Id.StringValue : undefined;
  }
  if (!ctId || !ctId.startsWith(docSetContentTypeId)) {
    throw new Error("Created content type is not a Document Set. CT Id: " + (ctId ?? "undefined"));
  }

  const listCts = await listRef.contentTypes.get();
  const alreadyOnList = listCts.some((ct) => ct.StringId === ctId);
  if (!alreadyOnList) {
    try {
      await listRef.contentTypes.addAvailableContentType(ctId);
    } catch {
      // ignore duplicate content type errors
    }
  }
};

const sanitizeListTitle = (title: string): string => {
  const cleaned = title.replace(/[\"#%*<>?\/\\{|}]/g, "").trim();
  if (cleaned.length === 0) {
    return "FormInstances";
  }
  return cleaned.substring(0, 255);
};

const ensureFormInstanceIdentifierField = async (listRef: IList): Promise<void> => {
  const fieldName = ActiveListFieldNames.formInstanceIdentifier;
  const existing = await listRef.fields
    .filter(`InternalName eq '${fieldName}' or Title eq '${fieldName}'`)
    .select("InternalName")
    .get();
  if (existing.length === 0) {
    await listRef.fields.addText(fieldName);
  }
};


const ensureTemplateIdAndWebUrlAssociationToBeRegisteredInRootWeb = async (siteRelativeUrl: string, templateIdentifier: string): Promise<ConfigListItem<string>> => {
  const configs = await getAssociatedWebUrlsForTemplateIdentifier(templateIdentifier);
  const matchesWithTitle = configs.filter((c) => c.config === siteRelativeUrl);
  const configAlreadyExists = matchesWithTitle.length > 0;
  if (configAlreadyExists === true) {
    return matchesWithTitle[0];
  } else {
    const config = await addTemplateWebUrlAssociationInRootWeb(templateIdentifier, siteRelativeUrl);
    return config;
  }
};

const createCType = (urlForWeb: string, parentCtId: string, name: string, description: string, groupName: string): Promise<void> => {
  const ctx = new SP.ClientContext(urlForWeb);
  const web = ctx.get_web();

  const contentTypeColl = web.get_contentTypes();
  const parentCt = web.get_availableContentTypes().getById(parentCtId);

  const newcType = new SP.ContentTypeCreationInformation();
  newcType.set_name(name);
  newcType.set_description(description);
  newcType.set_parentContentType(parentCt);
  newcType.set_group(groupName);
  contentTypeColl.add(newcType);

  return new Promise((resolve, reject) => {
    ctx.load(contentTypeColl);
    ctx.executeQueryAsync(
      (sender, x) => {
        log.debug("created contenttype", sender, x);
        resolve();
      },
      (sender, args) => {
        log.error("could not create contenttype", sender, args);
        reject();
      }
    );
  });
};

export const getFormTemplateConfig = async (webInfo: IWeb): Promise<ConfigListItem<FormTemplateConfig> | undefined> => {
  return ConfigListService.getConfigObject<FormTemplateConfig>(webInfo, ConfigListService.formTemplateConfigName);
};

export const getAssociatedWebUrlsForTemplateIdentifier = async (templateIdentifier: string): Promise<ConfigListItem<string>[]> => {
  const configName = getRootTemplateWebAssiciationConfigKey(templateIdentifier);
  const rootWeb = sp.site.rootWeb;
  const configs = await ConfigListService.getConfigStrings(rootWeb, configName);
  return configs;
};

const addTemplateWebUrlAssociationInRootWeb = async (templateIdentifier: string, siteRelativeUrl: string): Promise<ConfigListItem<string> | undefined> => {
  const configName = getRootTemplateWebAssiciationConfigKey(templateIdentifier);
  var context = await sp.site.getContextInfo();
  const result = await ConfigListService.addConfig(sp.site.rootWeb, configName, siteRelativeUrl);
  return result;
};

const getRootTemplateWebAssiciationConfigKey = (templateIdentifier: string): string => {
  return "templateUsage_" + templateIdentifier;
};
