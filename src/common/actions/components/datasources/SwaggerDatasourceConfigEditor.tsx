import log from "loglevel";
import React from "react";
import { useEffect, useState } from "react";
import { SPHttpClient } from "@microsoft/sp-http";
import { SwaggerDatasourceConfig } from "../../models/datasources/SwaggerDatasourceConfig";
import { useEditorContext } from "../../../helper/EditorContext";
import { useComponentContext } from "../../../helper/CurrentWebPartContext";
import { DropDownField } from "../../../listItem/fields/choiceField/dropdownField/DropDownField";
import { FieldTypeNames } from "../../../listItem/FieldTypeNames";
import { useFormConfigurationContext } from "../../../helper/FormConfigurationContext";
import { BooleanFieldDescription } from "../../../listItem/fields/booleanField/BooleanFieldDescription";
import { BooleanField } from "../../../listItem/fields/booleanField/BooleanField";
import { IDropDownFieldProps } from "../../../listItem/fields/choiceField/dropdownField/DropDownFieldProps";
import { TextKeyChoice } from "../../../listItem/fields/choiceField/ChoiceFieldDescription";
import { useLoadingIndicatorContext } from "../../../helper/LoadingIndicatorContext";

export const SwaggerDataSourceConfigEditor = (props: { swaggerDatasourceConfig: SwaggerDatasourceConfig; onConfigChanged: (newConfig: SwaggerDatasourceConfig) => void }): JSX.Element => {
  const [dropdownOptionsForActions, setDropdownOptionsForActions] = useState<string[]>([]);
  const context = useComponentContext();
  const [methodTypesForPathes, setMethodTypesForPathes] = useState<{ [operationPath: string]: string[] }>({ [props.swaggerDatasourceConfig.operationId]: [props.swaggerDatasourceConfig.operationType] });
  const editorContext = useEditorContext();
  const configContext = useFormConfigurationContext();
  const loadingIndicatorContext = useLoadingIndicatorContext();
  log.debug("rendering swaggerDatasourceConfigeditor with", { props: props, editorModel: editorContext.editorModel() });

  useEffect(() => {
    const createOperationChoicesFromSwaggerSchema = (swaggerSchema: any): string[] => {
      const optionsToReturn: string[] = [];
      const methodsGroupedByOperationPath: { [operationPath: string]: string[] } = {};
      if (swaggerSchema === undefined) {
        return [];
      }
      for (const key in swaggerSchema.paths) {
        const pathObject = swaggerSchema.paths[key];
        log.debug("found pathobject from swagger", pathObject);
        if (methodsGroupedByOperationPath[key] === undefined) {
          methodsGroupedByOperationPath[key] = [];
        }
        if (pathObject.get !== undefined) {
          if (pathObject.get.responses !== undefined) {
            if (pathObject.get.responses["200"] !== undefined) {
              optionsToReturn.push(key);
              methodsGroupedByOperationPath[key].push("get");
            }
          }
        }
        if (pathObject.post !== undefined) {
          if (pathObject.post.responses !== undefined) {
            if (pathObject.post.responses["200"] !== undefined) {
              optionsToReturn.push(key);
              methodsGroupedByOperationPath[key].push("post");
            }
          }
        }
      }

      setMethodTypesForPathes(methodsGroupedByOperationPath);

      return optionsToReturn;
    };
    const loadSchema = async () => {
      loadingIndicatorContext.setLoadingIndication(true, "Lade Datenquellen");
      try {
        const swaggerDatasourceFromConfig = configContext.swaggerDatasources.filter((ds) => ds.identifier === props.swaggerDatasourceConfig.knownSwaggerDatasourceId);
        if (swaggerDatasourceFromConfig.length > 0) {
          const urlToUse = swaggerDatasourceFromConfig[0].swaggerInfoUrl;
          log.debug("swaggerdatasourcefonfig: loading swaggerinfos", props);
          if (urlToUse !== "") {
            const result = await context.spHttpClient.fetch(urlToUse, SPHttpClient.configurations.v1, {});
            const json = await result.json();
            log.debug(result, json);
            setDropdownOptionsForActions(createOperationChoicesFromSwaggerSchema(json));
          }
        }
        loadingIndicatorContext.setIsLoading(false);
      } catch (e) {
        log.debug("could not load swagger defintion", e, props);
        loadingIndicatorContext.setIsLoading(false);
      }
    };
    loadSchema();
  }, [props.swaggerDatasourceConfig.knownSwaggerDatasourceId]);

  const operationPickerDefintion: IDropDownFieldProps = {
    validationErrors: [],
    fieldDescription: {
      formulaForChoices: "",
      uniqueKey: "operationId",
      type: FieldTypeNames.Choice,
      required: true,
      internalName: "operationId",
      fillInChoiceEnabled: false,
      enableMultipleSelections: false,
      description: "Operation ID Auswählen",
      displayName: "Operation ID",
      defaultValue: [],
      choices: dropdownOptionsForActions
    },
    editMode: true,
    fieldValue: [props.swaggerDatasourceConfig.operationId],
    rawData: "",
    onValueChanged: (field, value) => {
      const newConfig: SwaggerDatasourceConfig = { ...props.swaggerDatasourceConfig };
      const selectedValueIsString = typeof value[0] == "string";
      if (selectedValueIsString) {
        newConfig.operationId = value[0] as string;
      } else {
        newConfig.operationId = (value[0] as TextKeyChoice).text;
      }

      log.debug("operation id changed calling onchange with,", newConfig);
      props.onConfigChanged(newConfig);
    },
    onBlur: () => {},
    renderAsTextOnly: false
  };

  const methodTypePickerDefintion: IDropDownFieldProps = {
    validationErrors: [],
    fieldDescription: {
      formulaForChoices: "",
      uniqueKey: "operationType",
      type: FieldTypeNames.Choice,
      required: true,
      internalName: "operationType",
      fillInChoiceEnabled: false,
      enableMultipleSelections: false,
      description: "OperationTyp Auswählen",
      displayName: "Operation Type",
      defaultValue: [],
      choices: methodTypesForPathes[props.swaggerDatasourceConfig.operationId] === undefined ? [] : methodTypesForPathes[props.swaggerDatasourceConfig.operationId]
    },
    editMode: true,
    fieldValue: [props.swaggerDatasourceConfig.operationType],
    rawData: "",
    onValueChanged: (field, value) => {
      const newConfig: SwaggerDatasourceConfig = { ...props.swaggerDatasourceConfig };
      const selectedValueIsString = typeof value[0] == "string";

      if (selectedValueIsString) {
        newConfig.operationType = value[0] as string;
      } else {
        newConfig.operationType = (value[0] as TextKeyChoice).text;
      }

      log.debug("operation type changed calling onchange with,", newConfig);
      props.onConfigChanged(newConfig);
    },
    onBlur: () => {},
    renderAsTextOnly: false
  };

  const swaggerInfoUrlChoicesFieldProps: IDropDownFieldProps = {
    validationErrors: [],
    fieldDescription: {
      formulaForChoices: "",
      enableMultipleSelections: false,
      fillInChoiceEnabled: false,

      defaultValue: [],

      uniqueKey: "swaggerInfoUrl",
      type: FieldTypeNames.Choice,
      required: true,
      internalName: "swaggerInfoUrl",
      description: "SwaggerUrl eingeben",
      displayName: "enter SwaggerUrl",
      choices: [],
      textKeyChoices: configContext.swaggerDatasources.map((config) => {
        return {
          key: config.identifier,
          text: config.title,
          data: config
        };
      })
    },
    editMode: true,
    fieldValue: [props.swaggerDatasourceConfig.knownSwaggerDatasourceId],
    rawData: "",
    onBlur: () => {},
    onValueChanged: (field, value) => {
      const newConfig: SwaggerDatasourceConfig = { ...props.swaggerDatasourceConfig };

      const selectedValueIsString = typeof value[0] == "string";

      if (selectedValueIsString) {
        newConfig.knownSwaggerDatasourceId = value.length > 0 ? (value[0] as string) : "";
      } else {
        newConfig.knownSwaggerDatasourceId = value.length > 0 ? (value[0] as TextKeyChoice).text : "";
      }

      props.onConfigChanged(newConfig);
    },
    renderAsTextOnly: false
  };

  const openAsLinkBooleanFieldDefinition: BooleanFieldDescription = {
    defaultValue: false,
    description: "Gibt an, ob die Datenquelle als Link geöffnet werden soll bei Ausführung",
    displayName: "Datenquelle als Link in neuem Tab öffnen?",
    internalName: "openAsLink",
    required: false,
    type: FieldTypeNames.Boolean,
    uniqueKey: "openAsLink",
    isReadOnly: props.swaggerDatasourceConfig.operationType !== "get"
  };

  return (
    <>
      <DropDownField {...swaggerInfoUrlChoicesFieldProps}></DropDownField>
      <DropDownField {...operationPickerDefintion}></DropDownField>
      <DropDownField {...methodTypePickerDefintion}></DropDownField>
      {props.swaggerDatasourceConfig.operationType === "get" && (
        <>
          <BooleanField
            validationErrors={[]}
            renderAsTextOnly={false}
            fieldDescription={openAsLinkBooleanFieldDefinition}
            editMode={true}
            rawData={""}
            fieldValue={props.swaggerDatasourceConfig.openUrlAsLink === true}
            onBlur={() => {}}
            onValueChanged={(description, value) => {
              const newConfig: SwaggerDatasourceConfig = { ...props.swaggerDatasourceConfig };
              newConfig.openUrlAsLink = value;
              props.onConfigChanged(newConfig);
            }}
          />
        </>
      )}
    </>
  );
};
