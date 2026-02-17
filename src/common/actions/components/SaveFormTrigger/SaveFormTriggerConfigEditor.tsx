import { Checkbox } from "@fluentui/react";
import React from "react";
import { SaveFormTriggerConfig } from "../../models/saveFormTrigger/SaveFormTriggerConfig";
import { ConditionEditor } from "../../../components/editor/components/conditionEditor/ConditionEditor";
export const SaveFormTriggerConfigEditor = (props: { config: SaveFormTriggerConfig; onConfigChanged: (changedConfig: SaveFormTriggerConfig) => void }): JSX.Element => {
  return (
    <>
      <ConditionEditor
        conditionShouldProduceType="string"
        condition={props.config.fileNameExpression}
        label="Ausdruck für Dateiname"
        onChange={(val) => {
          props.onConfigChanged({ ...props.config, fileNameExpression: val });
        }}></ConditionEditor>

      <Checkbox
        checked={props.config.shouldRedirectAfterSave === true}
        label="Redirect nach Speichern ausführen?"
        onChange={(ev, val) => {
          props.onConfigChanged({ ...props.config, shouldRedirectAfterSave: val === true });
        }}></Checkbox>

      <Checkbox
        checked={props.config.shouldCreateVersion === true}
        label="Neue Version nach dem Speichern anlegen und Workflow triggern?"
        onChange={(ev, val) => {
          props.onConfigChanged({ ...props.config, shouldCreateVersion: val === true });
        }}></Checkbox>
      <ConditionEditor
        conditionShouldProduceType="string"
        condition={props.config.expressionForVersionComments}
        label="Ausdruck für Kommentar der neuen Version"
        onChange={(val) => {
          props.onConfigChanged({ ...props.config, expressionForVersionComments: val });
        }}></ConditionEditor>
    </>
  );
};
