import { IWeb } from "@pnp/sp/webs";
import { ConfigFieldNames, ListNames } from "../../extensions/formTemplateListActions/Constants";
import { ConfigListItem } from "../../extensions/common/models/ConfigListItem";

export class ConfigListService {
  static formTemplateConfigName = "formTemplateConfig";
  static formWebTitleConfigName = "Formular Titel";
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
}
