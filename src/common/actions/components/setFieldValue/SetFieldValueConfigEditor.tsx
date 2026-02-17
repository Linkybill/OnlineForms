import React from "react";
import { SetFieldValueTriggerConfig } from "../../models/setFieldValue/SetFieldValueTriggerConfig";
import log from "loglevel";
import { ConditionEditor } from "../../../components/editor/components/conditionEditor/ConditionEditor";
import { ParameterPickerLoadingOptions } from "../../../components/editor/components/ParameterPicker/ParameterPickerV2";
import { TextFieldWithParameterPicker } from "../../../components/editor/components/html/TextFieldWithParameterPicker";

export const SetFieldValueConfigEditor = (props: { config: SetFieldValueTriggerConfig; onConfigChanged: (changedConfig: SetFieldValueTriggerConfig) => void }): JSX.Element => {
  // todo determine matching fieldtype so that conditioneditor can pass concrete returnType which should be created by logicEditor. Currently i use any
  return (
    <>
      <label>Pfad auswählen, der gesetzt werden soll: </label>

      <TextFieldWithParameterPicker
        label="Pfad"
        pathDelimiter="/"
        onApprove={(path: string) => {
          log.debug("Parameter picked", path);

          props.onConfigChanged({ ...props.config, pathToPropertyInListItemToSet: path === null ? "" : path });
        }}
        parameterLoadingOptions={ParameterPickerLoadingOptions.FormFields}
        pathShouldStartWithDelimiter={true}
        value={props.config.pathToPropertyInListItemToSet}
      />
      <ConditionEditor
        conditionShouldProduceType="any"
        label={"Wert / Formel"}
        condition={props.config.expression}
        onChange={(newVal) => {
          props.onConfigChanged({ ...props.config, expression: newVal });
        }}></ConditionEditor>
    </>
  );
};
