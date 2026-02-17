import React, { useEffect, useState } from "react";
import { TemplatedForm } from "../../../components/formcomponents/components/templatedForm/TemplatedForm";
import { createFormTemplateBasedOnFields } from "../../../helper/FormTemplateGenerator";
import { useParameterPickerContext } from "../../../helper/parameterPickerContext/ParameterPickerContext";
import { FieldDescriptionTypes } from "../../../listItem/types/FieldDescriptionTypes";
import { DatasourceTriggerConfig } from "../../models/datasources/DatasourceTriggerConfig";
import { JsonTree } from "../../../jsonTree/JSONTree";
import log from "loglevel";
import { EditorContextProvider } from "../../../helper/EditorContext";
import { ListItemContextProvider } from "../../../helper/ListItemContext";
import { createDefaultItem } from "../../../listItem/helper/ListHelper";
import { useComponentContext } from "../../../helper/CurrentWebPartContext";
import { EditorModel } from "../../../components/editor/models/EditorModel";
import { SPHttpClient } from "@microsoft/sp-http";
import { DataSourceDefinition } from "../../models/datasources/DataSourceDefinition";
import { TextFieldDescription } from "../../../listItem/fields/textField/TextFieldDescription";
import { FieldTypeNames } from "../../../listItem/FieldTypeNames";

export const DatasourceTriggerTester = (props: { datasourceTriggerConfigToTest: DatasourceTriggerConfig; onCloseClicked: () => void }) => {
  const pickerContext = useParameterPickerContext();
  const [datasourceResult, setDatasourceResult] = useState<any>(null);

  const componentContext = useComponentContext();

  const datasourceDefintion = pickerContext.editorModel.datasources.filter((d) => d.uniqueIdentifier === props.datasourceTriggerConfigToTest.datasourceIdWhichGetsTriggered)[0];

  const [templateForTestUi, setTemplateForTestUi] = useState<EditorModel | undefined>(undefined);

  const createEmptyObjectBasedOnPath = (splittedPahs: string[], currentIndex: number, currentObject: any, valueToPasteAsLeafForLastIndexInPath): any => {
    var pathName = splittedPahs[currentIndex];

    if (currentIndex == splittedPahs.length - 1) {
    }
  };
  const createFieldsForTestUi = (
    datasourceDefintion: DataSourceDefinition,
    datasourceTriggerConfigToTest: DatasourceTriggerConfig,
    spHttpClient: SPHttpClient
  ): FieldDescriptionTypes[] | PromiseLike<FieldDescriptionTypes[]> => {
    const fieldsToReturn: FieldDescriptionTypes[] = [];
    datasourceTriggerConfigToTest.inputParameterMappings.forEach((m) => {
      const splittedParameterPath = m.sourceParameter.path.split("/");
      if (m.sourceParameter.path.toLowerCase().startsWith("/listitem")) {
        const listFieldName = splittedParameterPath[2];
        const fieldFromEditorModel = pickerContext.editorModel.customFieldDefinitions.filter((f) => f.internalName == listFieldName);
        fieldsToReturn.push({ ...fieldFromEditorModel[0] });
      } else {
        var textField: TextFieldDescription = {
          defaultValue: "",
          description: "",
          displayName: m.sourceParameter.parameterName,
          internalName: m.sourceParameter.path,
          type: FieldTypeNames.Text,
          required: false,
          uniqueKey: "testUi_" + m.sourceParameter.parameterName
        };
        fieldsToReturn.push(textField);
      }
    });
    return fieldsToReturn;
  };

  useEffect(() => {
    const loadTemplate = async () => {
      const fieldsForUsedInputMappings: FieldDescriptionTypes[] = await createFieldsForTestUi(datasourceDefintion, props.datasourceTriggerConfigToTest, componentContext.spHttpClient);
      const template = createFormTemplateBasedOnFields(fieldsForUsedInputMappings);
      setTemplateForTestUi(template);
    };
    loadTemplate();
  }, []);

  return (
    <>
      {templateForTestUi !== undefined && (
        <>
          <EditorContextProvider editorModel={templateForTestUi} isInEditMode={false}>
            <ListItemContextProvider
              registeredContainerHiddenWhenConditions={{}}
              registeredContainerLockedConditions={{}}
              onFormClose={props.onCloseClicked}
              onListItemSave={async (savedItem) => {
                try {
                  savedItem.getChangedProperties().forEach((p) => {
                    if (p.description.internalName.startsWith("/datasources")) {
                      let valueForDatasourceResult: any = p.value;
                      let nestedValue = valueForDatasourceResult;
                      const splittedPath = p.description.internalName.split("/");
                      if (splittedPath.length >= 3) {
                        for (let i = 3; i <= splittedPath.length - 1; i++) {
                          const pathName = splittedPath[i];
                          if (i == splittedPath.length - 1) {
                            nestedValue[pathName] = p.value;
                          } else {
                            nestedValue[pathName] = {};
                            nestedValue = nestedValue[pathName];
                          }
                        }
                        const datasourceName = splittedPath[2];

                        pickerContext.listItemContextForParameterPicker.setDatasourceResult(datasourceName, valueForDatasourceResult);
                      }
                    } else {
                      if (pickerContext.listItemContextForParameterPicker.getListItem().getProperty(p.description.internalName) !== undefined) {
                        pickerContext.listItemContextForParameterPicker.setFieldInfos(p.description.internalName, p.value);
                      }
                    }
                  });
                  pickerContext.listItemContextForParameterPicker.replaceListItemAndTriggerConditions(pickerContext.listItemContextForParameterPicker.getListItem());
                  await pickerContext.listItemContextForParameterPicker.executeDatasource(props.datasourceTriggerConfigToTest);
                  const result = pickerContext.listItemContextForParameterPicker.getDatasourceResult(props.datasourceTriggerConfigToTest.parameterName);
                  setDatasourceResult(result);
                  return savedItem;
                } catch (e) {
                  setDatasourceResult("Es ist ein Fehler aufgetreten, bitte log überprüfen und Networktraffic nachschauen");
                  log.error(e);
                }
              }}
              listItem={createDefaultItem(templateForTestUi.customFieldDefinitions, "", [])}>
              <TemplatedForm injectableComponents={[]} editMode={true} template={templateForTestUi.componentConfig} />
              <h2>Ergebnis</h2>
              <JsonTree data={datasourceResult} />
            </ListItemContextProvider>
          </EditorContextProvider>
        </>
      )}
    </>
  );
};
