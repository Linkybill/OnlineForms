import React, { useState } from "react";
import { ActionTrigger } from "../models/ActionTrigger";
import { FieldTypeNames } from "../../listItem/FieldTypeNames";
import { ActionTriggerConfigEditor } from "./ActionTriggerConfigEditor";
import { TriggerConfigType } from "../models/TriggerConfigType";
import { ActionButton } from "@fluentui/react";
import { TextField } from "../../listItem/fields/textField/TextField";
import { TextFieldDescription } from "../../listItem/fields/textField/TextFieldDescription";
import { ConditionEditor } from "../../components/editor/components/conditionEditor/ConditionEditor";
import { FormFieldSelector } from "../../formFieldSelector/FormFieldSelector";

export const ActionTriggerEditor = (props: {
  showMetadataInEditor: boolean;
  showConfigEditor: boolean;
  saveImmediatly: boolean;
  trigger: ActionTrigger;
  showSaveButton: boolean;
  onTriggerSaved: (trigger: ActionTrigger) => void;
  onCancel: () => void;
}): JSX.Element => {
  const [currentTrigger, setCurrentTrigger] = useState<ActionTrigger>(props.trigger);

  const titleFieldDescription: TextFieldDescription = {
    defaultValue: "",
    description: "Titel",
    displayName: "Titel",
    internalName: "Title",
    required: false,
    type: FieldTypeNames.Text,
    uniqueKey: "titleFieldKey",
    lockedWhenCondition: "",
    isReadOnly: false,
    requiredWhenCondition: "",
    validationRules: []
  };
  const descriptionFieldDescription: TextFieldDescription = {
    defaultValue: "",
    description: "Beschreibung",
    displayName: "Beschreibung",
    internalName: "Description",
    required: false,
    type: FieldTypeNames.Text,
    uniqueKey: "descriptionFieldKey",
    lockedWhenCondition: "",
    isReadOnly: false,
    requiredWhenCondition: "",
    validationRules: []
  };
  return (
    <>
      <>
        {props.showMetadataInEditor === true && (
          <>
            {currentTrigger.fieldNameWhichTriggersAction !== "" && (
              <>
                <FormFieldSelector
                  selectedFieldNames={[currentTrigger.fieldNameWhichTriggersAction]}
                  onSelectionChanged={(newVal) => {
                    setCurrentTrigger((old) => {
                      return { ...old, fieldNameWhichTriggersAction: newVal[0] };
                    });
                  }}
                  canSelectMultipleFields={false}
                  description="Feld, welches die Aktion triggert"
                  internalName="formFieldWhichTriggersAction"
                  label="Feld, welches die Aktion triggert"></FormFieldSelector>
              </>
            )}
            <TextField
              validationErrors={[]}
              renderAsTextOnly={false}
              rawData={""}
              editMode={true}
              fieldDescription={titleFieldDescription}
              fieldValue={currentTrigger.title}
              onValueChanged={() => {}}
              onBlur={(description, newVal) => {
                const modifiedConfig: ActionTrigger = { ...currentTrigger, title: newVal.toString() };
                setCurrentTrigger(modifiedConfig);
                if (props.saveImmediatly === true) {
                  props.onTriggerSaved(modifiedConfig);
                }
              }}></TextField>
            <TextField
              validationErrors={[]}
              renderAsTextOnly={false}
              rawData={""}
              editMode={true}
              fieldDescription={descriptionFieldDescription}
              fieldValue={currentTrigger.description}
              onValueChanged={() => {}}
              onBlur={(description, value) => {
                const modifiedConfig: ActionTrigger = { ...currentTrigger, description: value.toString() };
                setCurrentTrigger(modifiedConfig);
                if (props.saveImmediatly === true) {
                  props.onTriggerSaved(modifiedConfig);
                }
              }}></TextField>
            <ConditionEditor
              conditionShouldProduceType="boolean"
              label="Ausführungsbedingung"
              condition={currentTrigger.triggerCondition}
              onChange={(newCondition: string): void => {
                const modifiedConfig: ActionTrigger = { ...currentTrigger, triggerCondition: newCondition };
                setCurrentTrigger(modifiedConfig);
                if (props.saveImmediatly === true) {
                  props.onTriggerSaved(modifiedConfig);
                }
              }}></ConditionEditor>
          </>
        )}
      </>

      {props.showConfigEditor === true && (
        <>
          <ActionTriggerConfigEditor
            uniqueTriggerIdentifier={currentTrigger.uniqueIdentifier}
            triggerType={currentTrigger.type}
            actionTriggerConfig={currentTrigger.config}
            onConfigModified={(modifiedConfig: TriggerConfigType): void => {
              setCurrentTrigger((old) => {
                return { ...old, config: modifiedConfig };
              });
              if (props.saveImmediatly === true) {
                props.onTriggerSaved({ ...props.trigger, config: modifiedConfig });
              }
            }}
          />
        </>
      )}

      <>
        {props.showSaveButton === true && (
          <>
            <ActionButton
              key="save"
              text="Speichern"
              iconProps={{ iconName: "Save" }}
              onClick={() => {
                props.onTriggerSaved(currentTrigger);
              }}></ActionButton>
            <ActionButton
              key="cancel"
              text="Abbrechen"
              iconProps={{ iconName: "Cancel" }}
              onClick={() => {
                props.onCancel();
              }}></ActionButton>
          </>
        )}
      </>
    </>
  );
};
