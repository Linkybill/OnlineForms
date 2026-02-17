import React, { useRef } from "react";
import { LogicExpressionType } from "./types/LogicTypes";
import { DemoDataFormCreationInformatoinModel } from "./Models/DemoDataFormCreationInformationModel";
import { getType } from "../../../../jsonTree/TypeCheck";
import { isArray } from "lodash";
import { EditorContextProvider, useEditorContext } from "../../../../helper/EditorContext";
import { findAllDatasourceTriggers } from "../../../../helper/EditorContextHelper";
import { DatasourceTriggerConfig } from "../../../../actions/models/datasources/DatasourceTriggerConfig";
import { createFormTemplateBasedOnFields } from "../../../../helper/FormTemplateGenerator";
import { TemplatedForm } from "../../../formcomponents/components/templatedForm/TemplatedForm";
import { ListItemContextConsumer, ListItemContextProvider, useListItemContext } from "../../../../helper/ListItemContext";
import { createDefaultItem } from "../../../../listItem/helper/ListHelper";
import { ActionTrigger } from "../../../../actions/models/ActionTrigger";
import { ListItem } from "../../../../listItem/ListItem";
import log from "loglevel";
import { useParameterPickerContext } from "../../../../helper/parameterPickerContext/ParameterPickerContext";

export const DemoDataEditor = (props: { onDataApproved: (listIem: ListItem) => void | Promise<void>; condition: LogicExpressionType | string | number | boolean; onCancel: () => void }): JSX.Element => {
  const parameterPickerContext = useParameterPickerContext();
  const involvedDatasourceTriggers = useRef<DatasourceTriggerConfig[]>([]);
  const allTriggers = findAllDatasourceTriggers(parameterPickerContext.editorModel);
  const createFormCreationModel = (expression: LogicExpressionType | string | number | boolean, givenFormCreationModel: DemoDataFormCreationInformatoinModel): DemoDataFormCreationInformatoinModel => {
    const type = getType(expression);
    if (type === "object") {
      const keys = Object.keys(expression);
      if (keys.length > 0) {
        var firstKey = keys[0];
        const isVar = firstKey === "var";
        if (isVar == true && isArray(expression["var"])) {
          givenFormCreationModel = fillFormCreationModelFieldsFromVar(expression as any, givenFormCreationModel);
        }
        if (Array.isArray(expression[firstKey])) {
          expression[firstKey].forEach((parameterCondition) => {
            givenFormCreationModel = createFormCreationModel(parameterCondition, givenFormCreationModel);
          });
        }
      }
    }

    return givenFormCreationModel;
  };

  const fillFormCreationModelFieldsFromVar = (varParameter: { var: string[] }, givenCreationModel: DemoDataFormCreationInformatoinModel): DemoDataFormCreationInformatoinModel => {
    const parameterArrayWithPath = varParameter["var"];
    const path = parameterArrayWithPath[0];

    const splittedPath = path.split(".");
    if (splittedPath.length > 1) {
      const fieldNameOrDatasourcePathName = splittedPath[1];
      const pathIsFromListItem = path.toLowerCase().startsWith("listitem");
      const pathIsFromDatasources = path.toLowerCase().startsWith("datasources");

      if (pathIsFromListItem === true) {
        const field = parameterPickerContext.editorModel.customFieldDefinitions.filter((f) => f.internalName === fieldNameOrDatasourcePathName);

        if (field.length > 0) {
          var foundField = { ...field[0] };
          foundField.required = false;
          const formfieldAlreadyAdded = givenFormCreationModel.relevantFormFields.filter((f) => f.internalName === foundField.internalName).length > 0;
          if (formfieldAlreadyAdded === false) {
            givenCreationModel.relevantFormFields.push(foundField);
          }
        }
      }
      if (pathIsFromDatasources === true) {
        // todo: find all fields affected by datasource triggers
        let triggersWhichDoSetThePath = allTriggers.filter((t) => {
          return (t.config as DatasourceTriggerConfig).parameterName === fieldNameOrDatasourcePathName;
        });
        if (triggersWhichDoSetThePath.length > 1) {
          triggersWhichDoSetThePath = [triggersWhichDoSetThePath[0]];
        }
        triggersWhichDoSetThePath.forEach((involvedTrigger) => {
          fillFormCreationModelFromDatasourConfig(givenCreationModel, involvedTrigger);
        });
      }
    }
    return givenCreationModel;
  };

  const fillFormCreationModelFromDatasourConfig = (givenCreationModel: DemoDataFormCreationInformatoinModel, involvedTrigger: ActionTrigger): DemoDataFormCreationInformatoinModel => {
    const datasourceTriggerConfig = involvedTrigger.config as DatasourceTriggerConfig;
    involvedDatasourceTriggers.current.push(datasourceTriggerConfig);
    //const matchingDatasoures = allDatasources.filter((d) => d.uniqueIdentifier === datasourceTriggerConfig.datasourceIdWhichGetsTriggered);

    datasourceTriggerConfig.inputParameterMappings.forEach((mapping) => {
      if (mapping.sourceParameter.path !== undefined) {
        const splittedMappingPath = mapping.sourceParameter.path.split("/");
        if (splittedMappingPath.length >= 3) {
          var pathIsFromDatasource = splittedMappingPath[1].toLowerCase() === "datasources";
          if (pathIsFromDatasource == true) {
            var parameterName = splittedMappingPath[2];
            const dataSourceTriggerWhichSetsTheParameter = allTriggers.filter((t) => {
              return (t.config as DatasourceTriggerConfig).parameterName === parameterName;
            });
            if (dataSourceTriggerWhichSetsTheParameter.length > 0) {
              givenFormCreationModel = fillFormCreationModelFromDatasourConfig(givenCreationModel, dataSourceTriggerWhichSetsTheParameter[0]);
            }
          } else {
            const pathIsFromListItem = splittedMappingPath[1].toLowerCase() == "listitem";
            if (pathIsFromListItem == true) {
              const fieldName = splittedMappingPath[2];

              var matchingSourceFields = parameterPickerContext.editorModel.customFieldDefinitions.filter((f) => f.internalName === fieldName);
              if (matchingSourceFields.length > 0) {
                var field = { ...matchingSourceFields[0] };
                field.required = false;
                field.description = "Feld wird benutzt für Datenquellentrigger " + involvedTrigger.title;
                const fieldAlreadyAdded = givenFormCreationModel.relevantDatasourceFormFieldsGroupedByTitle.filter((f) => f.internalName === field.internalName).length > 0;
                if (fieldAlreadyAdded === false) {
                  givenCreationModel.relevantDatasourceFormFieldsGroupedByTitle.push(field);
                }
              }
            }
          }
        }
      }
    });
    return givenCreationModel;
  };

  let givenFormCreationModel: DemoDataFormCreationInformatoinModel = { relevantDatasourceFormFieldsGroupedByTitle: [], relevantFormFields: [] };
  givenFormCreationModel = createFormCreationModel(props.condition, givenFormCreationModel);
  const template = createFormTemplateBasedOnFields([...givenFormCreationModel.relevantFormFields, ...givenFormCreationModel.relevantDatasourceFormFieldsGroupedByTitle]);
  return (
    <>
      <EditorContextProvider
        isInEditMode={false}
        editorModel={{
          ...template
        }}>
        <ListItemContextProvider
          registeredContainerLockedConditions={{}}
          registeredContainerHiddenWhenConditions={{}}
          listItem={createDefaultItem(template.customFieldDefinitions, "", [])}
          onFormClose={() => {
            props.onCancel();
          }}
          onListItemSave={async (savedItem) => {
            savedItem.getProperties().forEach((p) => {
              if (p.valueChanged === true) {
                var fieldExistsInFormContext = parameterPickerContext.listItemContextForParameterPicker.getProperty(p.description.internalName) !== undefined;
                if (fieldExistsInFormContext) {
                  parameterPickerContext.listItemContextForParameterPicker.setFieldInfos(p.description.internalName, p.value);
                }
                // todo: what will we do later on with datasource fields?
              }
            });
            for (var i = involvedDatasourceTriggers.current.length - 1; i >= 0; i--) {
              await parameterPickerContext.listItemContextForParameterPicker.executeDatasource(involvedDatasourceTriggers.current[i]);
            }
            var item = parameterPickerContext.listItemContextForParameterPicker.getListItem();
            parameterPickerContext.listItemContextForParameterPicker.replaceListItemAndTriggerConditions(item);
            log.debug("listItem from outer ListItemContext passed in demoDataEditor", item);

            props.onDataApproved(item);
            return savedItem;
          }}>
          <ListItemContextConsumer>
            {(contextAccessor) => {
              return (
                <>
                  <TemplatedForm onSubmit={async (listItem: ListItem) => {}} editMode={true} injectableComponents={[]} template={template.componentConfig} />
                </>
              );
            }}
          </ListItemContextConsumer>
        </ListItemContextProvider>
      </EditorContextProvider>
    </>
  );
};
