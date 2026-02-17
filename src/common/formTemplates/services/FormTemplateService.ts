import { Guid } from "@microsoft/sp-core-library";
import { EditorModel } from "../../components/editor/models/EditorModel";
import { FormTemplate } from "../../../extensions/common/models/FormTemplate";
import { sp } from "@pnp/sp";
import { IWeb, IWebInfo } from "@pnp/sp/webs";
import { FormTemplateFieldNames, ListNames } from "../../../extensions/formTemplateListActions/Constants";
import { ErrorViewModel } from "../../models/ErrorViewModel";
import log from "loglevel";
import { FormTemplateConfig } from "../../configListService/models/FormTemplateConfig";
import "@pnp/sp";
import { ConfigListItem } from "../../../extensions/common/models/ConfigListItem";
import { ConfigListService } from "../../configListService/ConfigListService";
import { createDefaultJSOnOrLoadBaseTemplateJSon } from "../../../extensions/common/models/DefaultEditorModel";
import { FormTemplateUpdateResult } from "./TemplateUpdateResult";
import { createEfav2Client } from "../../../clients/efav2ClientCreator";
import { AddAndConfigureFormWebDto, ConfigureExistingFormWebDto } from "../../../clients/efav2Client";
import axios from "axios";

const featureIdWhichNeedsToGetActivatedInFormSubWebs = "1fbb5a1f-3ec3-45cf-a5d5-741cce28db2f";

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
      [FormTemplateFieldNames.templateFieldNameGueltigVon]: template.validFrom,
      ContentTypeId: "0x0101000C02C51080F16F458E04B9BCD328F38D"
    });
    return Promise.resolve({ error: undefined, model: { ...template, id: -1 } });
  } catch (e) {
    log.error("Error while adding a new formtemplate: ", e);
    return {
      error: "Template konnte nicht angelegt werden",
      model: template
    };
  }
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
  log.debug("going to add new template in new web");

  var client = await createEfav2Client("");
  const rootWeb = await sp.site.rootWeb.get();
  const dto: AddAndConfigureFormWebDto = new AddAndConfigureFormWebDto({
    formTitle: title,
    rootWebUrl: rootWeb.Url
  });
  const template: FormTemplate = {
    currentETag: "1",
    description: description,
    validFrom: validFrom,
    validUntil: validUntil,
    templateIdenfitier: templateIdentifier,
    templateVersionIdentifier: versionIdentifier,
    title: title
  };

  const response = await client.addAndConfigureFormWeb(dto);

  if (response.validationError === "" || response.validationError === undefined || response.validationError === null) {
    const web = await sp.site.openWebById(response.createdWebId);
    try {
      var newWeb = await (await sp.site.openWebById(response.createdWebId)).web.get();
      var createdSiteRelativeUrl = newWeb.Url.replace(rootWeb.Url, "");
      ensureTemplateConfigInWeb(web.web, templateIdentifier);
      await ensureTemplateIdAndWebUrlAssociationToBeRegisteredInRootWeb(createdSiteRelativeUrl, templateIdentifier);
    } catch (eConfig) {
      log.error("could not add configuration item for web", { webInfoObject: web.data, error: eConfig });
      return {
        error: "Das erstellte Web konnte nicht konfiguriert werden",
        model: template
      };
    }
  }

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
    const item = await sp.site.rootWeb.lists.getByTitle(ListNames.formTemplateListName).items.getById(templateItemId).get();
    log.debug("loaded item without expand", item);
    const template = await sp.site.rootWeb.lists.getByTitle(ListNames.formTemplateListName).items.getById(templateItemId).file.getJSON();
    log.debug("loadFormTemplate, loaded listitem", template, item);
    return {
      error: undefined,
      model: {
        currentETag: item["odata.etag"],
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
  log.debug("going to add new template in existing web");
  const web = await sp.site.openWebById(webId);
  await ensureConfigList(web.web);
  const resolvedWeb = await web.web.get();
  const resolvedRootWeb = await sp.site.rootWeb.get();
  const siteRelativeWebUrl = resolvedWeb.Url.replace(resolvedRootWeb.Url, "");

  try {
    const efaClient = await createEfav2Client("");
    var dto = new ConfigureExistingFormWebDto({
      formTitle: formTemplateTitle,
      webUrl: resolvedWeb.Url
    });

    await efaClient.configureExistingFormWebForForm(dto);
  } catch (eContentType) {
    log.error(eContentType);
    return {
      error: "ContentType konnte nicht erstellt werden",
      model: undefined
    };
  }
  try {
    await ensureTemplateConfigInWeb(web.web, templateIdentifier);
  } catch (eConfig) {
    log.error(eConfig);
    return {
      error: "Konfiguration für Template konnte nicht erstellt werden",
      model: undefined
    };
  }
  try {
    await ensureTemplateIdAndWebUrlAssociationToBeRegisteredInRootWeb(siteRelativeWebUrl, templateIdentifier);
  } catch (e) {
    log.error("Could not add root config for template", templateIdentifier, e);
    return {
      error: "Konfiguration für Template konnte nicht erstellt werden",
      model: undefined
    };
  }
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
