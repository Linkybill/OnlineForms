import { IWeb } from "@pnp/sp/webs";
import { ConfigFieldNames, ListNames } from "../../extensions/formTemplateListActionsOnline/Constants";
import { ConfigListItem } from "../../extensions/common/models/ConfigListItem";

export class ConfigListService {
  static formTemplateConfigName = "formTemplateConfig";
  static formPrefixConfigName = "FormPrefix";
  static swaggerDatasourcesConfigName = "Datenquellen";

  public static getConfigString = async <TConfig>(webInfo: IWeb, configName: string): Promise<ConfigListItem<string> | undefined> => {
    const configItems = await webInfo.lists.getByTitle(ListNames.configListName).items.filter(ConfigFieldNames.configNameFieldName + " eq '" + configName + "'")();
    if (configItems.length === 0) {
      return Promise.resolve(undefined);
    }
    const config: string = configItems[0][ConfigFieldNames.configValueFieldName];
    const itemId = configItems[0].ID;
    return Promise.resolve({
      itemId: itemId,
      config: config
    });
  };

  public static getConfigStrings = async <TConfig>(webInfo: IWeb, configName: string): Promise<ConfigListItem<string>[]> => {
    const configItems = await webInfo.lists.getByTitle(ListNames.configListName).items.filter(ConfigFieldNames.configNameFieldName + " eq '" + configName + "'")();
    return configItems.map((item) => {
      const config: string = item[ConfigFieldNames.configValueFieldName];
      const itemId = item.ID;
      return {
        config: config,
        itemId: itemId
      };
    });
  };

  public static getConfigStringsByPrefix = async (webInfo: IWeb, configNamePrefix: string): Promise<ConfigListItem<string>[]> => {
    const filter = "startswith(" + ConfigFieldNames.configNameFieldName + ", '" + configNamePrefix + "')";
    const configItems = await webInfo.lists.getByTitle(ListNames.configListName).items.filter(filter)();
    return configItems.map((item) => {
      const config: string = item[ConfigFieldNames.configValueFieldName];
      const itemId = item.ID;
      return {
        config: config,
        itemId: itemId
      };
    });
  };

  public static getConfigItemsByPrefix = async (webInfo: IWeb, configNamePrefix: string): Promise<{ itemId: number; configName: string; config: string }[]> => {
    const filter = "startswith(" + ConfigFieldNames.configNameFieldName + ", '" + configNamePrefix + "')";
    const configItems = await webInfo.lists.getByTitle(ListNames.configListName).items.filter(filter)();
    return configItems.map((item) => {
      const config: string = item[ConfigFieldNames.configValueFieldName];
      const configName: string = item[ConfigFieldNames.configNameFieldName];
      const itemId = item.ID;
      return {
        config: config,
        configName: configName,
        itemId: itemId
      };
    });
  };


  public static getConfigObject = async <TConfig>(webInfo: IWeb, configName: string): Promise<ConfigListItem<TConfig> | undefined> => {
    const configItems = await webInfo.lists.getByTitle(ListNames.configListName).items.filter(ConfigFieldNames.configNameFieldName + " eq '" + configName + "'")();
    if (configItems.length === 0) {
      return Promise.resolve(undefined);
    }

    const config: TConfig = JSON.parse(configItems[0][ConfigFieldNames.configValueFieldName]);
    const itemId = configItems[0].ID;
    return Promise.resolve({
      itemId: itemId,
      config: config
    });
  };

  static addConfig = async <TConfigType>(web: IWeb, configTitle: string, configToAdd: TConfigType): Promise<ConfigListItem<TConfigType>> => {
    const result = await web.lists
      .getByTitle(ListNames.configListName)
      .items.add({ [ConfigFieldNames.configNameFieldName]: configTitle, [ConfigFieldNames.configValueFieldName]: typeof configToAdd === "string" ? configToAdd : JSON.stringify(configToAdd) });

    return {
      itemId: result.data.ID,
      config: typeof configToAdd === "string" ? result.data[ConfigFieldNames.configValueFieldName] : JSON.parse(result.data[ConfigFieldNames.configValueFieldName])
    };
  };

  static overwriteConfig = async <TConfig>(webInfo: IWeb, config: TConfig, itemId: number): Promise<ConfigListItem<TConfig>> => {
    const itemUpdateResult = await webInfo.lists
      .getByTitle(ListNames.configListName)
      .items.getById(itemId)
      .update({ [ConfigFieldNames.configValueFieldName]: JSON.stringify(config) });

    return Promise.resolve({
      itemId: itemId,
      config: config
    });
  };

  static upsertConfigString = async (webInfo: IWeb, configName: string, configValue: string): Promise<ConfigListItem<string>> => {
    const configItems = await webInfo.lists.getByTitle(ListNames.configListName).items.filter(ConfigFieldNames.configNameFieldName + " eq '" + configName + "'")();
    if (configItems.length === 0) {
      return await ConfigListService.addConfig<string>(webInfo, configName, configValue);
    }
    const itemId = configItems[0].ID;
    const itemUpdateResult = await webInfo.lists
      .getByTitle(ListNames.configListName)
      .items.getById(itemId)
      .update({ [ConfigFieldNames.configValueFieldName]: configValue });
    return {
      itemId: itemId,
      config: itemUpdateResult.data[ConfigFieldNames.configValueFieldName]
    };
  };
}
