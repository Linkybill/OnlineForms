import { useContext, useRef } from "react";
import * as React from "react";
import { FieldValueTypes } from "../listItem/types/FieldValueTypes";
import { ListItem } from "../listItem/ListItem";
import { IListItemContextProviderProps } from "./IListItemContextProviderProps";
import * as log from "loglevel";
import { ListItemField } from "../listItem/fields/base/ListItemField";
import { FieldDescriptionTypes } from "../listItem/types/FieldDescriptionTypes";
import { FieldDescription } from "../listItem/fields/base/FieldDescription";
import { useEditorContext } from "./EditorContext";
import { useComponentContext } from "./CurrentWebPartContext";
import { DatasourceExecutor } from "../actions/services/DatasourceExecutor";
import { DatasourceTriggerConfig } from "../actions/models/datasources/DatasourceTriggerConfig";
import { ActionTrigger } from "../actions/models/ActionTrigger";
import { TriggerTypes } from "../actions/models/ActionTriggerTypes";
import { SetFieldValueTriggerConfig } from "../actions/models/setFieldValue/SetFieldValueTriggerConfig";
import { createDataForJsonLogic, updateObjectAtPath, getValueFromPath } from "./ObjectByPathHelper";
import { JSONLogicInstance } from "./JSONLogicInstance";
import { SaveFormTriggerConfig } from "../actions/models/saveFormTrigger/SaveFormTriggerConfig";
import { ContainerTriggerConfig } from "../actions/models/ContainerTrigger/ContainerTriggerConfig";
import { FieldTypeNames } from "../listItem/FieldTypeNames";
import { ModalWithCloseButton } from "../components/modals/ModalWithCloseButton";
import { DefaultButton, MessageBar, MessageBarType, Modal } from "@fluentui/react";
import { useFormConfigurationContext } from "./FormConfigurationContext";
import { DateTimeValue } from "../listItem/fields/dateTimeField/DateTimeValue";
import { DateTimeDisplayMode, DateTimeFieldDescription } from "../listItem/fields/dateTimeField/DateTimeFieldDescription";
import { FormStatusFlow } from "../formStatusFlow/components/FormStatusFlow";
import { IGraphDataResponseDto } from "../formStatusFlow/models/GraphResponse";
import { usePermissionContext } from "./PermissionContext";
import { FormContentService } from "../services/FormContentService";
import { CreateFormVersionTriggerConfig } from "../actions/models/createFormVersion/CreateFormVersionTriggerConfig";
import { useFormFileContext } from "./FormFileContext";
import { useFormContentLoadingContext } from "./FormContentLoadingContext";
import { mapListItemToObject } from "../listItem/mapper/ListItemToObjectMapper";
import { createDefaultItem } from "../listItem/helper/ListHelper";
import { useServerLoggingContext } from "../logging/ServerLoggingContext";
import { Logmodel } from "../logging/LogModel";
import { JsonLogicHelper } from "./JSONLogicHelper";
import { createEfav2Client } from "../../clients/efav2ClientCreator";
import { CreateListItemsRequestDto } from "../../clients/efav2Client";
import { SharePointCreateListItemsTriggerConfig } from "../actions/models/sharePointCreateListItems/SharePointCreateListItemsTriggerConfig";
import { ParameterMapping } from "../actions/models/datasources/ParameterMapping";
import { SetRepeatedListFieldTriggerConfig } from "../actions/models/setRepeatedListField/SetRepeatedListFieldTriggerConfig";

// todo: Seperate context into ListItemContext, ParameterContext and ConditionContext, where COnditionContext has access to ListItemContext and ParameterContext
export interface IListItemAccessor {
  restoreFormDefaults: (fieldNamesToIgnore: string[]) => void;
  executeDatasource?: (datasourceTrigger: DatasourceTriggerConfig) => Promise<void>;
  getBlockingScreenMessage: () => string;
  isErrorScrolled: () => boolean;
  setDidScrollToError: () => void;
  incrementErrorScrollCount: () => void;
  getErrorScrollCount: () => number;

  resetErrorScrollInfo: () => void;
  setDatasourceResult: (key: string, result: any) => void;
  getDatasourceResult: (key: string) => any;
  getDatasourceResults: () => { [key: string]: any };
  setFieldInfos: (fieldName: string, value: FieldValueTypes, errors?: string[]) => void;
  getFieldValue: (fieldName: string) => FieldValueTypes;
  getProperty: (fieldName: string) => ListItemField<FieldDescriptionTypes, FieldValueTypes>;
  getListItem: () => ListItem;
  replaceListItemAndTriggerConditions: (item: ListItem, ignoreTriggers?: boolean) => void;
  isConditionRequiredFullfilled: (key: string, defaultValue: boolean) => boolean;
  isConditionLockedFullfilled: (key: string, defaultValue: boolean) => boolean;
  doesHaveConditionLockedStrnig: (key: string) => boolean;
  isConditionHiddenFullfilled: (key: string, defaultValue: boolean) => boolean;
  checkCondition: (condition: string, defaultValue: boolean) => boolean;
  applyValidationRules: () => boolean;
  triggerActionsForField: (description: FieldDescription<FieldValueTypes>) => void;

  disableButtons: () => void;
  enableButtons: () => void;
  isButtonDisabled: () => boolean;
  showStatusFlow: (dto: IGraphDataResponseDto, statusWindowTitle: string | undefined | null) => void;
  closeStatusFlow: () => void;
  closeForm: () => void;
  shouldShowHelptextsOnFields: boolean;
}

const ListItemContext = React.createContext<IListItemAccessor | undefined>({
  restoreFormDefaults: () => {},
  getBlockingScreenMessage: () => "",
  showStatusFlow: () => {},
  incrementErrorScrollCount: () => {
    throw new Error("incrementErrorScrollCount is not implemented");
  },
  getErrorScrollCount: () => {
    throw new Error("getErrorScrollCount is not implemented");
  },
  isErrorScrolled: () => {
    throw new Error("isErrorScrolled is not implemented");
  },
  setDidScrollToError: () => {
    throw new Error("setDidScrollToError is not implemented");
  },
  resetErrorScrollInfo: () => {
    throw new Error("resetErrorScrollInfo is not implemented");
  },
  closeStatusFlow: () => {},
  setDatasourceResult: () => {
    throw new Error("onSave is not implemented");
  },
  getDatasourceResult: () => {
    throw new Error("onSave is not implemented");
  },
  setFieldInfos: function (fieldName: string, value: FieldValueTypes): void {
    throw new Error("Function not implemented.");
  },
  getFieldValue: function (fieldName: string): FieldValueTypes {
    throw new Error("Function not implemented.");
  },
  getProperty: function (fieldName: string): ListItemField<FieldDescriptionTypes, FieldValueTypes> {
    throw new Error("Function not implemented.");
  },
  getListItem: function (): ListItem {
    throw new Error("Function not implemented.");
  },
  replaceListItemAndTriggerConditions: function (item: ListItem): void {
    throw new Error("Function not implemented.");
  },
  isConditionRequiredFullfilled: function (key: string, defaultValue: boolean): boolean {
    return defaultValue;
  },
  isConditionLockedFullfilled: function (key: string, defaultValue: boolean): boolean {
    return defaultValue;
  },
  isConditionHiddenFullfilled: (key: string, defaultValue: boolean) => {
    return defaultValue;
  },

  checkCondition: function (condition: string): boolean {
    return false;
  },
  applyValidationRules: (): boolean => {
    throw new Error("Function not implemented.");
  },
  triggerActionsForField: () => {
    throw new Error("Function not implemented.");
  },

  disableButtons: function (): void {
    throw new Error("Function not implemented.");
  },
  enableButtons: function (): void {
    throw new Error("Function not implemented.");
  },
  isButtonDisabled: function (): boolean {
    throw new Error("Function not implemented.");
  },
  getDatasourceResults: function (): { [key: string]: any } {
    throw new Error("Function not implemented.");
  },
  closeForm: function (): void {
    throw new Error("Function not implemented.");
  },
  shouldShowHelptextsOnFields: false,
  doesHaveConditionLockedStrnig: function (key: string): boolean {
    return false;
  }
});

export const useListItemContext = () => useContext(ListItemContext);

export const ListItemContextProvider: React.FC<IListItemContextProviderProps> = (props): JSX.Element => {
  const [messageToShowWhileActionsAreRunning, setMessageToShowWhileActionsAreRunning] = React.useState<string>("");
  const fieldNameWhichDidSetMessageToShowWhileActionsAreRunning = useRef<string>("");
  const formContentLoadedContext = useFormContentLoadingContext();
  const formContextDidGetAdded = useRef<boolean>(false);

  const fileContextProvider = useFormFileContext();
  const didScrollToError = useRef<boolean>(false);
  const errorScrollCount = useRef<number>(0);

  const startUpTriggersGotExecuted = useRef<boolean>(false);
  const [statusFlowVisible, setStatusFlowVisible] = React.useState<boolean>(false);
  const [statusWindowTitle, SetStatusWindowTitle] = React.useState<string>("");
  const [statusFlowData, setStatusFlowData] = React.useState<IGraphDataResponseDto | undefined>(undefined);
  const editorContext = useEditorContext();
  const currentListItem = useRef<ListItem>(props.listItem);
  const [listItem, setListItem] = React.useState<ListItem>(props.listItem);

  const registeredKeysForConditions = React.useRef<string[]>([]);
  const registeredDefaultValuesForConditionResults = React.useRef<{ [keyWithPrefix: string]: boolean }>({});
  const currentConditionResults = React.useRef<{ [keyWithPrefix: string]: boolean }>({});
  const registeredConditions = useRef<{ [conditionKey: string]: string }>({});

  const componentContext = useComponentContext();
  const permissionContext = usePermissionContext();
  const datasourceResults = React.useRef<{ [key: string]: any }>({});

  const [buttonsAreDisabled, setButtonsAreDisabled] = React.useState<boolean>(false);
  const [triggersAreExecuting, setTriggersAreExecuting] = React.useState<boolean>(true);

  const [message, setMessage] = React.useState<string>("");
  const [messageBarType, setMessageBarType] = React.useState<MessageBarType>(MessageBarType.info);
  const triggerInterruption = useRef<boolean>(false);
  const configContext = useFormConfigurationContext();
  const loggingContext = useServerLoggingContext();

  const showMessage = (message: string, messageBarType: MessageBarType) => {
    setMessage(message);
    setMessageBarType(messageBarType);
  };

  const hideMessage = () => {
    setMessage("");
  };

  log.debug("rendering ListItemContextProvider with props", props);

  const executeDatasource = async (datasourceTrigger: DatasourceTriggerConfig) => {
    const datasource = editorContext.editorModel().datasources.filter((ds) => ds.uniqueIdentifier === datasourceTrigger.datasourceIdWhichGetsTriggered)[0];
    if (datasource !== undefined) {
      const dataObject = createDataForJsonLogic(listItem, datasourceResults.current);
      const result = await DatasourceExecutor.executeDatasource(configContext.swaggerDatasources, datasource, datasourceTrigger, dataObject, componentContext.spHttpClient, loggingContext.getCurrentCorrelationId());
      log.debug("executed Datasource with result for parameter: " + datasourceTrigger.parameterName, { result: result, outputMappings: datasourceTrigger.parameterName });

      itemAccessor.setDatasourceResult(datasourceTrigger.parameterName, result);
    }
  };

  // itemAccessor wird weiter unten erstellt. Wir nutzen aber hier schon evalLogic,
  // weil es erst in callbacks ausgeführt wird (nachdem itemAccessor existiert).
  const evalLogic = <T,>(expression: string | any, item: ListItem, ds: { [key: string]: any }, listItemIdForLogic: number): T => {
    const helper = new JsonLogicHelper(componentContext.context, itemAccessor, listItemIdForLogic, permissionContext);
    return helper.evaluate<T>(expression, item, ds);
  };

  const itemAccessor: IListItemAccessor = {
    restoreFormDefaults: (ignoreFIeldNames) => {
      var newItem = createDefaultItem(
        props.listItem.getProperties().map((p) => p.description),
        listItem.ContentTypeId,
        []
      );
      newItem.getProperties().forEach((p) => {
        if (ignoreFIeldNames.indexOf(p.description.internalName) == -1) {
          setFieldInfos(p.description.internalName, p.value);
        }
      });
    },
    executeDatasource: executeDatasource,

    getBlockingScreenMessage: () => messageToShowWhileActionsAreRunning,
    isErrorScrolled: () => didScrollToError.current,
    setDidScrollToError: () => {
      didScrollToError.current = true;
    },
    resetErrorScrollInfo: () => {
      didScrollToError.current = false;
    },
    shouldShowHelptextsOnFields: props.shouldShowHelpTextsOnFields === false ? false : true,

    setDatasourceResult: (key, result): void => {
      datasourceResults.current[key] = result;
    },
    getDatasourceResults: () => {
      return datasourceResults.current;
    },
    getDatasourceResult: (key): any => {
      return datasourceResults.current[key];
    },

    triggerActionsForField: async (fieldDescription: FieldDescription<FieldValueTypes>) => {
      if (fieldDescription.expressionForMessageWhileActionsAreRunning !== undefined && fieldDescription.expressionForMessageWhileActionsAreRunning !== "") {
        if (messageToShowWhileActionsAreRunning == "") {
          const result = evalLogic<string>(fieldDescription.expressionForMessageWhileActionsAreRunning, listItem, datasourceResults.current, props.listItem.ID);
          fieldNameWhichDidSetMessageToShowWhileActionsAreRunning.current = fieldDescription.internalName;
          setMessageToShowWhileActionsAreRunning(result);
        }
      }

      triggerInterruption.current = false;
      const triggers = editorContext.editorModel().fieldTriggers.filter((t) => t.fieldNameWhichTriggersAction === fieldDescription.internalName);
      for (let i = 0; i < triggers.length; i++) {
        const trigger = triggers[i];
        log.debug("trigering action for trigger with id " + trigger.uniqueIdentifier, trigger, trigger.uniqueIdentifier);

        await executeTrigger(trigger);
      }
      itemAccessor.replaceListItemAndTriggerConditions(currentListItem.current);
      if (fieldNameWhichDidSetMessageToShowWhileActionsAreRunning.current === fieldDescription.internalName) {
        fieldNameWhichDidSetMessageToShowWhileActionsAreRunning.current = "";
        setMessageToShowWhileActionsAreRunning("");
      }
    },

    setFieldInfos: function (fieldName: string, value: FieldValueTypes, errors?: string[]): void {
      setFieldInfos(fieldName, value, errors);
    },
    getFieldValue: function (fieldName: string): FieldValueTypes {
      return currentListItem.current.getProperty(fieldName).value;
    },
    getProperty: function (fieldName: string): ListItemField<FieldDescriptionTypes, FieldValueTypes> {
      return currentListItem.current.getProperty(fieldName);
    },
    getListItem: function (): ListItem {
      return currentListItem.current;
    },

    replaceListItemAndTriggerConditions: (itemToSet: ListItem, ignoreTrigger?: boolean) => {
      const item = new ListItem(itemToSet.ID);
      item.Guid = itemToSet.Guid;
      item.addProperties(itemToSet.getProperties());
      currentListItem.current = item;
      currentConditionResults.current = {};
      registeredConditions.current = {};
      registeredKeysForConditions.current = [];

      applyAllConditions();

      setListItem(item);
      log.debug("replaced listitem", { newItem: item });
    },

    isConditionHiddenFullfilled: (key: string, defaultValue: boolean): boolean => {
      const condition = props.registeredContainerHiddenWhenConditions[key];
      log.debug("check condition for " + key, key, defaultValue);
      var result = executeCondition(condition, defaultValue);
      log.debug("checked hiddenwhencondition", { key, condition, result });
      return result;
    },

    isConditionRequiredFullfilled: (key: string): boolean => {
      const fields = editorContext.editorModel().customFieldDefinitions.filter((field) => field.internalName === key);

      if (fields.length > 0) {
        const field = fields[0];
        if (field.required === true) {
          return true;
        }
        const condition = field.requiredWhenCondition;

        const result = executeCondition(condition, false);
        log.debug("checked requiredWhenCondition for field " + key, { result: result });
        return result;
      }
      return false;
    },

    doesHaveConditionLockedStrnig: (key: string): boolean => {
      return props.registeredContainerLockedConditions[key] !== undefined && props.registeredContainerLockedConditions[key] !== null && props.registeredContainerLockedConditions[key] !== "";
    },

    isConditionLockedFullfilled: (key: string, defaultValue: boolean): boolean => {
      const condition = props.registeredContainerLockedConditions[key];
      return executeCondition(condition, defaultValue);
    },

    checkCondition: (condition: string, defaultValue: boolean): boolean => {
      return checkCondition(condition, defaultValue);
    },

    applyValidationRules: (): boolean => {
      let hasErrors = false;

      const errorsGroupedByFieldName: { [key: string]: string[] } = {};
      itemAccessor
        .getListItem()
        .getProperties()
        .forEach((itemProp) => {
          let propHasErrors = false;
          const isLocked = checkCondition(itemProp.description.lockedWhenCondition, false);

          if (isLocked === false) {
            if (itemProp.description.required === true || (itemProp.description.requiredWhenCondition !== undefined && itemProp.description.requiredWhenCondition !== "")) {
              let requiredWhenValidationShouldGetExecuted = true;

              if (itemProp.description.requiredWhenCondition !== undefined && itemProp.description.requiredWhenCondition !== null && itemProp.description.requiredWhenCondition !== "") {
                requiredWhenValidationShouldGetExecuted = executeCondition(itemProp.description.requiredWhenCondition, false);
              }
              if (requiredWhenValidationShouldGetExecuted === true) {
                if (itemProp.description.type === FieldTypeNames.DateTime) {
                  const dateTimeValue = itemProp.value as DateTimeValue;
                  if (dateTimeValue === undefined || dateTimeValue.date === undefined) {
                    hasErrors = true;
                    propHasErrors = true;
                  }

                  if ((itemProp.description as DateTimeFieldDescription).displayMode === DateTimeDisplayMode.DateAndTime && (dateTimeValue === undefined || dateTimeValue.time === undefined)) {
                    hasErrors = true;
                    propHasErrors = true;
                  }
                }
                if (
                  itemProp.value === undefined ||
                  itemProp.value === null ||
                  (Array.isArray(itemProp.value) && itemProp.value.length === 0) ||
                  itemProp.value === "" ||
                  (itemProp.description.type === FieldTypeNames.Boolean && itemProp.value !== true)
                ) {
                  hasErrors = true;
                  propHasErrors = true;
                }
                if (Array.isArray(itemProp.value) && itemProp.value.length > 0) {
                  for (var i = 0; i < itemProp.value.length; i++) {
                    const val = itemProp.value[i];
                    if (val === undefined || val === null || (typeof val === "string" && val.trim() == "")) {
                      hasErrors = true;
                      propHasErrors = true;
                      break;
                    }
                  }
                }
              }
            }
            if (propHasErrors === true) {
              if (errorsGroupedByFieldName[itemProp.description.internalName] === undefined) {
                errorsGroupedByFieldName[itemProp.description.internalName] = [];
              }
              errorsGroupedByFieldName[itemProp.description.internalName].push("Bitte ausfüllen");
            }

            if (itemProp.description.validationRules !== null && itemProp.description.validationRules !== undefined) {
              itemProp.description.validationRules.forEach((rule) => {
                const conditionShouldExecute = checkCondition(rule.condition, true) && rule.isActive !== false;
                if (conditionShouldExecute === true) {
                  const result = checkCondition(rule.validationRule, false);
                  if (result === false) {
                    hasErrors = true;
                    propHasErrors = true;

                    if (errorsGroupedByFieldName[itemProp.description.internalName] === undefined) {
                      errorsGroupedByFieldName[itemProp.description.internalName] = [];
                    }
                    errorsGroupedByFieldName[itemProp.description.internalName].push(rule.errorMessageOnFail);
                  } else {
                    if (errorsGroupedByFieldName[itemProp.description.internalName] === undefined) {
                      errorsGroupedByFieldName[itemProp.description.internalName] = [];
                    }
                    errorsGroupedByFieldName[itemProp.description.internalName].push("");
                  }
                  log.debug("validation result: ", {
                    result: result,
                    rule: rule
                  });
                }
              });
            }
          }
        });

      listItem.getProperties().forEach((p) => {
        const errorsToSet = errorsGroupedByFieldName[p.description.internalName] !== undefined ? errorsGroupedByFieldName[p.description.internalName].filter((e) => e !== "") : [];
        setFieldInfos(p.description.internalName, p.value, errorsToSet);
      });
      itemAccessor.resetErrorScrollInfo();
      itemAccessor.incrementErrorScrollCount();
      return hasErrors;
    },

    disableButtons: function (): void {
      setButtonsAreDisabled(true);
    },
    enableButtons: function (): void {
      setButtonsAreDisabled(false);
    },
    isButtonDisabled: function (): boolean {
      return buttonsAreDisabled === true;
    },
    closeForm: function (): void {
      props.onFormClose();
    },
    showStatusFlow: (dto: IGraphDataResponseDto, statusWindowTitle: string | undefined | null) => {
      setStatusFlowVisible(true);
      SetStatusWindowTitle(statusWindowTitle);
      setStatusFlowData(dto);
    },
    closeStatusFlow: function (): void {
      setStatusFlowVisible(false);
      setStatusFlowData(undefined);
    },
    incrementErrorScrollCount: function (): void {
      errorScrollCount.current += 1;
    },
    getErrorScrollCount: function (): number {
      return errorScrollCount.current;
    }
  };

  const setFieldInfos = (fieldName: string, value: FieldValueTypes, errors?: string[]): void => {
    log.debug("setting fieldInfos for field " + fieldName, { fieldName: fieldName, value: value, errors: errors });
    const newItem = new ListItem(currentListItem.current.ID);
    newItem.Guid = listItem.Guid;
    newItem.addProperties(currentListItem.current.getProperties());
    newItem.setValue(fieldName, value);

    newItem.setErrors(fieldName, errors !== undefined ? errors : []);
    currentListItem.current = newItem;
  };

  const modifyValueOfListItemByPath = (listItemPath: string, valueToChange: any): any => {
    let pathWithoutListItemInBeginning = listItemPath.replace("/" + "listItem" + "/", "");
    const splittedListItemPathWithoutListItemInBeginning = pathWithoutListItemInBeginning.split("/");
    const listItemFIeldName = splittedListItemPathWithoutListItemInBeginning[0];
    if (splittedListItemPathWithoutListItemInBeginning.length === 1) {
      setFieldInfos(listItemFIeldName, valueToChange);
    } else {
      let currentValue = listItem.getProperty(listItemFIeldName).value;
      const pathInCurrentValueWhichShouldChange = splittedListItemPathWithoutListItemInBeginning.filter((item, index) => {
        return index !== 0;
      });
      const newValue = updateObjectAtPath(currentValue, pathInCurrentValueWhichShouldChange, valueToChange);
      setFieldInfos(listItemFIeldName, newValue);
    }
  };

  const normalizePath = (path: string | undefined): string => {
    if (path === undefined || path === null || path === "") {
      return "";
    }
    return path.startsWith("/") ? path : "/" + path;
  };

  const normalizeWebUrl = (webUrl: string | undefined): string => {
    if (webUrl === undefined || webUrl === null) {
      return "";
    }
    const trimmed = webUrl.trim();
    if (trimmed === "") {
      return "";
    }
    if (trimmed.startsWith("/")) {
      return window.location.protocol + "//" + window.location.host + trimmed;
    }
    return trimmed;
  };

  const extractTargetFieldName = (targetPath: string, fallback: string): string => {
    if (fallback !== undefined && fallback !== "") {
      return fallback;
    }
    const normalized = normalizePath(targetPath);
    const segments = normalized.split("/").filter((s) => s !== "");
    return segments.length > 0 ? segments[segments.length - 1] : "";
  };

  const getValueFromArrayContext = (sourcePath: string, arrayPath: string, arrayElement: any): any => {
    const relative = sourcePath.substring(arrayPath.length);
    let relativeSegments = relative.split("/").filter((s) => s !== "");
    if (relativeSegments.length > 0 && (relativeSegments[0] === "0" || relativeSegments[0] === "index")) {
      relativeSegments = relativeSegments.slice(1);
    }
    if (relativeSegments.length === 0) {
      return arrayElement;
    }
    return getValueFromPath(arrayElement, relativeSegments);
  };

  const buildListItemObjectFromMappings = (mappings: ParameterMapping[], dataObject: any, arrayPath: string, arrayElement: any): { [key: string]: any } => {
    const itemObject: { [key: string]: any } = {};
    mappings.forEach((mapping) => {
      const sourcePath = normalizePath(mapping.sourceParameter.path);
      const targetFieldName = extractTargetFieldName(mapping.targetParameter.path, mapping.targetParameter.parameterName);
      if (targetFieldName === "") {
        return;
      }

      let valueToUse: any = undefined;
      if (arrayPath !== "" && arrayElement !== undefined && (sourcePath === arrayPath || sourcePath.startsWith(arrayPath + "/"))) {
        valueToUse = getValueFromArrayContext(sourcePath, arrayPath, arrayElement);
      } else {
        valueToUse = getValueFromPath(dataObject, sourcePath.split("/"));
      }
      itemObject[targetFieldName] = valueToUse;
    });
    return itemObject;
  };

  const executeTrigger = async (trigger: ActionTrigger): Promise<void> => {
    log.debug("going to execute trigger", trigger);

    try {
      let triggerShouldGetExecuted: boolean = true;

      if (trigger.triggerCondition !== "" && trigger.triggerCondition !== null && trigger.triggerCondition !== undefined) {
        const dataObject = createDataForJsonLogic(listItem, datasourceResults.current);
        log.debug("checking executeCondition for trigger " + trigger.title, { data: dataObject, triggerCondition: trigger.triggerCondition });

        const result = evalLogic<boolean>(trigger.triggerCondition, listItem, datasourceResults.current, props.listItem.ID);

        if (result === false) {
          triggerShouldGetExecuted = false;
        }
      }
      if (triggerInterruption.current === true) {
        triggerShouldGetExecuted = false;
      }
      if (triggerShouldGetExecuted)
        switch (trigger.type) {
          case TriggerTypes.DatasourceTriggerType:
            await executeDatasource(trigger.config as DatasourceTriggerConfig);
            break;

          case TriggerTypes.SetFieldValueTriggerType:
            try {
              log.debug("going to set fieldvalue for fieldvalueaction" + (trigger.config as SetFieldValueTriggerConfig).pathToPropertyInListItemToSet, trigger);
              const setFieldValueConfig = trigger.config as SetFieldValueTriggerConfig;

              const result = evalLogic<any>(setFieldValueConfig.expression, listItem, datasourceResults.current, props.listItem.ID);

              log.debug("Result for setFieldValueTrigger for field " + setFieldValueConfig.pathToPropertyInListItemToSet, {
                result: result,
                triggerConfig: trigger,
                expression: setFieldValueConfig.expression
              });

              if (setFieldValueConfig.pathToPropertyInListItemToSet !== "") {
                modifyValueOfListItemByPath(setFieldValueConfig.pathToPropertyInListItemToSet, result);
              }
            } catch (e) {
              log.error("could not set fieldvalue for trigger: ", trigger, e);
              const logModel: Logmodel = {
                text: "could not set fieldvalue for trigger",
                type: "Action",
                trigger: trigger,
                originalError: e,
                listItemContext: currentListItem.current
              };
              loggingContext.logCollectedLogsAsError(logModel);
            }
            break;

          case TriggerTypes.SaveFormTriggerType:
            log.debug("going to save item");
            itemAccessor.disableButtons();

            const itemHasConflicingChanges = props.listItemHasConflictingChanges !== undefined ? await props.listItemHasConflictingChanges() : false;
            if (itemHasConflicingChanges === true) {
              triggerInterruption.current = true;
              showMessage("Das Formularelement hat sich inzwischen geändert, bitte neu laden", MessageBarType.info);
            }

            if (itemHasConflicingChanges === false) {
              const saveFomTrigger = editorContext.editorModel().saveTriggers;
              const saveFormTriggerConfig = trigger.config as SaveFormTriggerConfig;
              for (let i = 0; i < saveFomTrigger.length; i++) {
                const trigger = saveFomTrigger[i];
                await executeTrigger(trigger);
              }
              itemAccessor.replaceListItemAndTriggerConditions(currentListItem.current);
              try {
                const fileNameExpression = saveFormTriggerConfig.fileNameExpression;
                const fileNameToSet = evalLogic<string>(fileNameExpression, listItem, datasourceResults.current, props.listItem.ID);

                const item = await props.onListItemSave(itemAccessor.getListItem(), fileContextProvider.filesBeingUploaded(), fileContextProvider.filenamesBeingDeleted(), fileNameToSet);

                itemAccessor.replaceListItemAndTriggerConditions(item);
                const itemHasErrors = item.getProperties().filter((p) => p.validationErrors !== undefined && p.validationErrors.length > 0).length > 0;
                if (itemHasErrors === true) {
                  itemAccessor.enableButtons();
                } else {
                  if (saveFormTriggerConfig.shouldCreateVersion === true) {
                    let comment: string = "";
                    if (saveFormTriggerConfig.expressionForVersionComments !== undefined && saveFormTriggerConfig.expressionForVersionComments !== null && saveFormTriggerConfig.expressionForVersionComments !== "") {
                      comment = evalLogic<string>(saveFormTriggerConfig.expressionForVersionComments, listItem, datasourceResults.current, props.listItem.ID);
                    }
                    const formService = new FormContentService();
                    await formService.createVersionAndTriggerWorkflow(item.ID, comment, loggingContext.getCurrentCorrelationId());
                  }
                  if (saveFormTriggerConfig.shouldRedirectAfterSave == true) {
                    itemAccessor.closeForm();
                  }
                }
                if (saveFormTriggerConfig.shouldRedirectAfterSave !== true) {
                  itemAccessor.enableButtons();
                }
              } catch (e) {
                log.error("could not add item", { error: e });
                setMessage("Das Formular konnte nicht gespeichert werden. Bitte teilen Sie die CorrelationId dem Supportteam mit: " + loggingContext.getCurrentCorrelationId());
              }
            }
            break;

          case TriggerTypes.ContainerTriggerType: {
            const config = trigger.config as ContainerTriggerConfig;
            for (let i = 0; i < config.childActions.length; i++) {
              const toExecute = config.childActions[i];
              await executeTrigger(toExecute);
            }
            break;
          }

          case TriggerTypes.CreateVersionTriggerType: {
            const config = trigger.config as CreateFormVersionTriggerConfig;
            let comment: string = "";
            if (config.commentExpression !== null && config.commentExpression !== undefined && config.commentExpression !== "") {
              comment = evalLogic<string>(config.commentExpression, listItem, datasourceResults.current, props.listItem.ID);
            }
            const formContentService = new FormContentService();
            const id = itemAccessor.getListItem().ID;
            await formContentService.createVersionAndTriggerWorkflow(id, comment, loggingContext.getCurrentCorrelationId());
            break;
          }

          case TriggerTypes.SharePointCreateListItemsTriggerType: {
            const config = trigger.config as SharePointCreateListItemsTriggerConfig;
            log.info("Executing SharePoint Listenelemente anlegen Trigger", { config: config, trigger });

            try {
              const webUrl = normalizeWebUrl(config.webUrl);
              if (webUrl === "" || config.listName === undefined || config.listName === "") {
                log.warn("WebUrl oder Listenname fehlt, SharePoint Listenelemente werden nicht angelegt.", { config: config });
                break;
              }
              const dataObject = createDataForJsonLogic(listItem, datasourceResults.current);
              const arrayPath = normalizePath(config.multipleItemsSourcePath);
              const arrayValue = arrayPath !== "" ? getValueFromPath(dataObject, arrayPath.split("/")) : undefined;

              let itemsToCreate: { [key: string]: any }[] = [];

              if (config.createMultipleItems === true) {
                if (Array.isArray(arrayValue) && arrayValue.length > 0) {
                  itemsToCreate = arrayValue.map((arrayElement) => buildListItemObjectFromMappings(config.parameterMappings, dataObject, arrayPath, arrayElement));
                } else {
                  log.warn("Mehrfachanlage gewählt, aber kein Array gefunden.", { arrayPath: arrayPath, arrayValue: arrayValue });
                }
              } else {
                let arrayElementForSingle: any = undefined;
                if (Array.isArray(arrayValue) && arrayValue.length > 0) {
                  arrayElementForSingle = arrayValue[0];
                }
                itemsToCreate = [buildListItemObjectFromMappings(config.parameterMappings, dataObject, arrayPath, arrayElementForSingle)];
              }

              if (itemsToCreate.length === 0) {
                log.warn("Keine Listenelemente zum Anlegen erzeugt.", { config: config });
                break;
              }

              const dto = new CreateListItemsRequestDto({
                webUrl: webUrl,
                listTitle: config.listName,
                items: itemsToCreate
              });

              const efaClient = await createEfav2Client(loggingContext.getCurrentCorrelationId());
              await efaClient.createListItems(dto);
            } catch (e) {
              log.error("Fehler beim Anlegen von SharePoint Listenelementen", e, trigger);
            }
            break;
          }

          case TriggerTypes.SetRepeatedListFieldTriggerType: {
            const config = trigger.config as SetRepeatedListFieldTriggerConfig;
            log.info("Executing Wiederholtes Feld setzen Trigger", { config: config, trigger });

            try {
              const targetPath = normalizePath(config.targetListFieldPath);
              if (targetPath === "") {
                log.warn("Ziel-Feld fehlt, Wiederholtes Feld wird nicht gesetzt.", { config: config });
                break;
              }

              const dataObject = createDataForJsonLogic(listItem, datasourceResults.current);
              const arrayPath = normalizePath(config.multipleItemsSourcePath);
              const arrayValue = arrayPath !== "" ? getValueFromPath(dataObject, arrayPath.split("/")) : undefined;

              let itemsToSet: { [key: string]: any }[] = [];

              if (config.createMultipleItems === true) {
                if (Array.isArray(arrayValue) && arrayValue.length > 0) {
                  itemsToSet = arrayValue.map((arrayElement) => buildListItemObjectFromMappings(config.parameterMappings, dataObject, arrayPath, arrayElement));
                } else {
                  log.warn("Mehrfachanlage gewaehlt, aber kein Array gefunden.", { arrayPath: arrayPath, arrayValue: arrayValue });
                }
              } else {
                let arrayElementForSingle: any = undefined;
                if (Array.isArray(arrayValue) && arrayValue.length > 0) {
                  arrayElementForSingle = arrayValue[0];
                }
                itemsToSet = [buildListItemObjectFromMappings(config.parameterMappings, dataObject, arrayPath, arrayElementForSingle)];
              }

              if (itemsToSet.length === 0) {
                log.warn("Keine Wiederholten Elemente zum Setzen erzeugt.", { config: config });
                break;
              }

              modifyValueOfListItemByPath(targetPath, itemsToSet);
            } catch (e) {
              log.error("Fehler beim Setzen des Wiederholten Feldes", e, trigger);
            }
            break;
          }
        }
    } catch (e) {
      log.error("trigger konnte nicht ausgeführt werden", trigger, e);
      const logModel: Logmodel = {
        text: "Trigger konnte nicht ausgeführt werden",
        type: "Action",
        trigger: trigger,
        originalError: e,
        listItemContext: currentListItem.current
      };
      loggingContext.logCollectedLogsAsError(logModel);
    }
  };

  const executeCondition = (condition: string, defaultValue: boolean): boolean => {
    if (condition !== null && condition !== undefined && condition !== "") {
      try {
        const result = evalLogic<boolean>(condition, listItem, datasourceResults.current, props.listItem.ID);
        log.debug("check for condition" + condition, { condition: condition, result: result });
        if (result !== true && result !== false) {
          log.warn("condition did not result in a boolean", condition, condition);
          return defaultValue;
        } else {
          return result;
        }
      } catch (e) {
        log.error("could not check condition", { condition: condition });
        return defaultValue;
      }
    }
    return defaultValue;
  };

  React.useEffect(() => {
    if (formContextDidGetAdded.current === false) {
      formContextDidGetAdded.current = true;
      if (formContentLoadedContext !== undefined) {
        formContentLoadedContext.addFormToBeLoaded();
      }
    }
  }, []);

  React.useEffect(() => {
    if (props.shouldUpdateListItemInUseEffect == true) {
      currentListItem.current = props.listItem;
      setListItem(props.listItem);
    }
    resetRegisteredConditions(props.listItem);

    applyAllConditions();
    setListItem(props.listItem);
  }, [JSON.stringify(mapListItemToObject(props.listItem)), JSON.stringify(editorContext.getContainerFieldsAreLockedConditions()), JSON.stringify(editorContext.getContainerHiddenWhenConditions())]);

  React.useEffect(() => {
    const executeStartupTriggers = async () => {
      if (permissionContext.currentUserCanWrite() == true) {
        if (startUpTriggersGotExecuted.current === false) {
          const model = editorContext.editorModel();
          log.debug("found start triggers", model.startupTriggers);
          const startTriggers = model.startupTriggers;
          for (let i = 0; i < startTriggers.length; i++) {
            const trigger = startTriggers[i];
            await executeTrigger(trigger);
          }
          startUpTriggersGotExecuted.current = true;
          itemAccessor.replaceListItemAndTriggerConditions(currentListItem.current);
          setTriggersAreExecuting(false);
          return;
        }
      }
      setTriggersAreExecuting(false);
    };

    if (editorContext.editorModel().startupTriggers.length > 0) {
      executeStartupTriggers();
    } else {
      setTriggersAreExecuting(false);
    }
  }, [props.reExecuteStartupTriggersNumber]);

  React.useEffect(() => {
    if (triggersAreExecuting === false) {
      if (formContentLoadedContext !== undefined) {
        formContentLoadedContext.addLoadedForm();
      }
    }
  }, [triggersAreExecuting]);

  const applyRegisteredCondition = (key: string): void => {
    const condition: string = registeredConditions.current[key];
    if (condition !== undefined && condition !== "") {
      try {
        const result = evalLogic<boolean>(condition, listItem, datasourceResults.current, props.listItem.ID);
        if (result !== true && result !== false) {
          log.warn("condition did not result in a boolean", key, condition, condition);
        } else {
          currentConditionResults.current = { ...currentConditionResults.current, [key]: result };
        }
      } catch (e) {
        currentConditionResults.current = { ...currentConditionResults.current, [key]: registeredDefaultValuesForConditionResults[key] };
      }
    }
  };

  const applyAllConditions: () => void = (): void => {
    registeredKeysForConditions.current.forEach((key) => {
      applyRegisteredCondition(key);
    });
  };

  const checkCondition = (condition: string, defaultValue: boolean): boolean => {
    if (condition === undefined || condition === null || condition === "") {
      return defaultValue;
    }

    try {
      const result = evalLogic<boolean>(condition, listItem, datasourceResults.current, props.listItem.ID);
      log.debug("checked condition " + condition, { condition: condition, result: result });
      if (result !== true && result !== false) {
        log.warn("condition did not result in a boolean", condition, listItem);
        return defaultValue;
      } else {
        return result;
      }
    } catch (e) {
      log.warn("could not check condition", condition, e);
      return defaultValue;
    }
  };

  const resetRegisteredConditions = (listItem: ListItem): void => {
    registeredConditions.current = {};
    registeredKeysForConditions.current = [];
  };

  log.debug("rendering listItemContext for list with listItemId " + listItem.ID + " with ", { listItem: listItem, datasources: datasourceResults });

  return (
    <ListItemContext.Provider value={itemAccessor}>
      <>
        {message !== "" && (
          <>
            <ModalWithCloseButton
              isOpen={true}
              onClose={() => {
                hideMessage();
              }}
              title="Meldung">
              <MessageBar messageBarType={messageBarType}>{message}</MessageBar>
            </ModalWithCloseButton>
          </>
        )}
      </>
      <>
        {messageToShowWhileActionsAreRunning !== "" && (
          <>
            <Modal isOpen={true} isBlocking={true}>
              <MessageBar messageBarType={messageBarType}>{messageToShowWhileActionsAreRunning}</MessageBar>
            </Modal>
          </>
        )}
      </>
      <>
        {statusFlowVisible === true && (
          <ModalWithCloseButton
            isOpen={true}
            onClose={() => {
              setStatusFlowData(undefined);
              setStatusFlowVisible(false);
            }}
            title={statusWindowTitle}
            className="WorkflowStatus">
            <FormStatusFlow flowModel={statusFlowData}></FormStatusFlow>
            <DefaultButton
              text="Schließen"
              onClick={() => {
                setStatusFlowData(undefined);
                setStatusFlowVisible(false);
              }}
              style={{ float: "right", marginBottom: 15, marginTop: 5, marginRight: 8 }}></DefaultButton>
          </ModalWithCloseButton>
        )}
      </>
      {props.children}
    </ListItemContext.Provider>
  );
};

export const ListItemContextConsumer: React.FC<{
  children: (listItem: IListItemAccessor) => JSX.Element;
}> = (props): JSX.Element => {
  return <ListItemContext.Consumer>{(li) => <>{props.children(li)}</>}</ListItemContext.Consumer>;
};
