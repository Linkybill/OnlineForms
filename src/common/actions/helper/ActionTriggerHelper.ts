import { Guid } from "@microsoft/sp-core-library";
import { ActionTrigger } from "../models/ActionTrigger";
import { ContainerTriggerType, TriggerType, TriggerTypes } from "../models/ActionTriggerTypes";
import log from "loglevel";
import { createEmptyDatasourceTriggerConfig } from "./DatasourceHelper";
import { SetFieldValueTriggerConfig } from "../models/setFieldValue/SetFieldValueTriggerConfig";
import { TriggerConfigType } from "../models/TriggerConfigType";
import { SaveFormTriggerConfig } from "../models/saveFormTrigger/SaveFormTriggerConfig";
import { ContainerTriggerConfig } from "../models/ContainerTrigger/ContainerTriggerConfig";
import { CreateFormVersionTriggerConfig } from "../models/createFormVersion/CreateFormVersionTriggerConfig";
import { SharePointCreateListItemsTriggerConfig } from "../models/sharePointCreateListItems/SharePointCreateListItemsTriggerConfig";
import { SetRepeatedListFieldTriggerConfig } from "../models/setRepeatedListField/SetRepeatedListFieldTriggerConfig";

export const createEmptyActionTrigger = (triggerType: TriggerType, fieldNameWhichTriggersAction: string | undefined, executionOrder: number): ActionTrigger => {
  switch (triggerType) {
    case TriggerTypes.DatasourceTriggerType:
      const datasourceConfig = createEmptyDatasourceTriggerConfig();
      return createConfig(triggerType, "Neuer Datenquellentrigger", "Neuer Datenquellentrigger", fieldNameWhichTriggersAction, datasourceConfig, executionOrder);

    case TriggerTypes.SetFieldValueTriggerType:
      const setFieldValueConfig: SetFieldValueTriggerConfig = {
        expression: "",
        pathToPropertyInListItemToSet: ""
      };
      return createConfig(triggerType, "Neuer Wertsetzentrigger", "Neuer Wertsetzentrigger", fieldNameWhichTriggersAction, setFieldValueConfig, executionOrder);
    case TriggerTypes.SaveFormTriggerType:
      const config: SaveFormTriggerConfig = {
        fileNameExpression: "",
        shouldRedirectAfterSave: true,
        shouldCreateVersion: true,
        expressionForVersionComments: '{"log":["eine neue Version"]}'
      };
      return createConfig(triggerType, "Speicherntrigger", "Speicherntrigger - Speichert das Formular", fieldNameWhichTriggersAction, config, executionOrder);
    case TriggerTypes.ContainerTriggerType:
      const containerConfig: ContainerTriggerConfig = {
        childActions: []
      };
      return createConfig(triggerType, "Neuer Container", "Neuer Container", fieldNameWhichTriggersAction, containerConfig, executionOrder);

    case TriggerTypes.CreateVersionTriggerType:
      const versionTriggerConfig: CreateFormVersionTriggerConfig = {
        commentExpression: ""
      };
      return createConfig(
        triggerType,
        "Neue Version anlegen und Workflow triggern",
        "Erstellt eine neue Version des Formulars und löst den Workflow dadurch aus",
        fieldNameWhichTriggersAction,
        versionTriggerConfig,
        executionOrder
      );

    case TriggerTypes.SharePointCreateListItemsTriggerType:
      const sharePointCreateListItemsConfig: SharePointCreateListItemsTriggerConfig = {
        webUrl: "",
        listName: "",
        createMultipleItems: false,
        multipleItemsSourcePath: "",
        parameterMappings: []
      };
      return createConfig(
        triggerType,
        "SharePoint Listenelemente anlegen",
        "Erstellt neue Elemente in einer SharePoint-Liste",
        fieldNameWhichTriggersAction,
        sharePointCreateListItemsConfig,
        executionOrder
      );
    case TriggerTypes.SetRepeatedListFieldTriggerType:
      const setRepeatedListFieldConfig: SetRepeatedListFieldTriggerConfig = {
        targetListFieldPath: "",
        createMultipleItems: false,
        multipleItemsSourcePath: "",
        parameterMappings: []
      };
      return createConfig(
        triggerType,
        "Wiederholtes Element setzen",
        "Setzt Werte in einem Wiederholten Feld",
        fieldNameWhichTriggersAction,
        setRepeatedListFieldConfig,
        executionOrder
      );

    default:
      log.error("createEmptyActionTrigger: triggerType not supported for creating an empty ActionTrigger", triggerType);
      throw new Error("not supported ActionTriggerType " + triggerType);
  }
};

const createConfig = (triggerType: TriggerType, triggerTitle: string, triggerDescription: string, fieldNameWhichTriggersAction: string | undefined, config: TriggerConfigType, executionOrder: number): ActionTrigger => {
  return {
    executionOrder: executionOrder,
    config: config,
    description: triggerDescription,
    title: triggerTitle,
    fieldNameWhichTriggersAction: fieldNameWhichTriggersAction === undefined ? "" : fieldNameWhichTriggersAction,
    triggerCondition: null,
    type: triggerType,
    uniqueIdentifier: Guid.newGuid().toString()
  };
};
