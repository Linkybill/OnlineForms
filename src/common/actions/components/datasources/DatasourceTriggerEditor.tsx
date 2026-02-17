import { DatasourceTriggerConfig } from "../../models/datasources/DatasourceTriggerConfig";
import React, { useState } from "react";
import { useEditorContext } from "../../../helper/EditorContext";
import { FieldTypeNames } from "../../../listItem/FieldTypeNames";
import { DropDownField } from "../../../listItem/fields/choiceField/dropdownField/DropDownField";
import { TextKeyChoice } from "../../../listItem/fields/choiceField/ChoiceFieldDescription";
import { TextField } from "../../../listItem/fields/textField/TextField";
import { TextFieldDescription } from "../../../listItem/fields/textField/TextFieldDescription";
import { DatasourceInputParameterMapper } from "./DatasourceInputParameterMapper";
import { ActionButton } from "@fluentui/react";
import { ModalWithCloseButton } from "../../../components/modals/ModalWithCloseButton";
import { DatasourceTriggerTester } from "./DatasourceTriggerTester";

export const DatasourceTriggerEditor = (props: { datasourceTrigger: DatasourceTriggerConfig | undefined; onDatasourceTriggerChanged: (datasourceTrigger: DatasourceTriggerConfig) => void }): JSX.Element => {
  const editorContext = useEditorContext();
  const [datasourceTestUiVisible, setDatasourceTestUiVisible] = useState<boolean>(false);
  const choicesForDatasourceOption: TextKeyChoice[] = editorContext.editorModel().datasources.map((ds) => {
    return {
      key: ds.uniqueIdentifier,
      text: ds.title
    };
  });

  const textFieldDescriptionForParameterName: TextFieldDescription = {
    defaultValue: "",
    description: "Parametername",
    displayName: "Parametername",
    internalName: "Parametername",
    required: true,
    type: FieldTypeNames.Text,
    uniqueKey: "ParameterNameTextField"
  };

  return (
    <>
      <DropDownField
        onBlur={() => {}}
        rawData={""}
        renderAsTextOnly={false}
        validationErrors={[]}
        editMode={true}
        fieldDescription={{
          formulaForChoices: "",
          choices: choicesForDatasourceOption.map((c) => c.key),
          textKeyChoices: choicesForDatasourceOption,
          defaultValue: [],
          description: "Datenquelle auswählen",
          displayName: "Datenquelle",
          enableMultipleSelections: false,
          fillInChoiceEnabled: false,
          internalName: "Datasource",
          required: true,
          type: FieldTypeNames.Choice,
          uniqueKey: "Datasource"
        }}
        fieldValue={props.datasourceTrigger !== undefined ? [props.datasourceTrigger.datasourceIdWhichGetsTriggered] : [""]}
        onValueChanged={(field, value) => {
          const newDatasourceTrigger = { ...props.datasourceTrigger };
          newDatasourceTrigger.datasourceIdWhichGetsTriggered = value[0] as string;
          props.onDatasourceTriggerChanged(newDatasourceTrigger);
        }}></DropDownField>
      <TextField
        validationErrors={[]}
        rawData={""}
        renderAsTextOnly={false}
        onValueChanged={(description, value) => {
          const newDatasourceTrigger = { ...props.datasourceTrigger };
          newDatasourceTrigger.parameterName = value.toString();
          props.onDatasourceTriggerChanged(newDatasourceTrigger);
        }}
        editMode={true}
        fieldDescription={textFieldDescriptionForParameterName}
        fieldValue={props.datasourceTrigger.parameterName}
        onBlur={(description, value) => {}}></TextField>
      <>
        <h5>Eingabeparametermappings</h5>
        <DatasourceInputParameterMapper
          parameterMappings={props.datasourceTrigger.inputParameterMappings}
          datasourceId={props.datasourceTrigger.datasourceIdWhichGetsTriggered}
          onMappingChanged={(newMappings) => {
            props.onDatasourceTriggerChanged({ ...props.datasourceTrigger, inputParameterMappings: newMappings });
          }}
        />
        <>
          <div>
            <ActionButton
              text="Datenquelle testen"
              onClick={() => {
                setDatasourceTestUiVisible(true);
              }}
            />
          </div>
          {datasourceTestUiVisible == true && (
            <>
              <ModalWithCloseButton
                isOpen={true}
                onClose={() => {
                  setDatasourceTestUiVisible(false);
                }}
                title="Datenquellentrigger testen">
                <>
                  <DatasourceTriggerTester
                    datasourceTriggerConfigToTest={props.datasourceTrigger}
                    onCloseClicked={() => {
                      setDatasourceTestUiVisible(false);
                    }}
                  />
                </>
              </ModalWithCloseButton>
            </>
          )}
        </>
      </>
    </>
  );
};
