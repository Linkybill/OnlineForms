import React, { useState } from "react";
import { JsonTree } from "../../../jsonTree/JSONTree";
import { IFieldComponentProps } from "../base/FieldComponentProps";
import { JSONDataFieldDescription } from "./JSONDataFieldDescription";
import { LabelWithRequiredInfo } from "../../labelWithRequiredInfo";
import { TextField } from "@fluentui/react";

export interface IJSONDataFieldProps extends IFieldComponentProps<JSONDataFieldDescription, any> {
  showCommandbar?: boolean;
}

export const JSONDataField = (props: IJSONDataFieldProps): JSX.Element => {
  var text = "";
  try {
    text = JSON.stringify(props.fieldValue);
  } catch (e) {}

  const [textValue, setTextValue] = useState(text);

  return (
    <>
      <LabelWithRequiredInfo required={props.fieldDescription.required} text={props.fieldDescription.displayName} />
      {props.editMode === true && (
        <>
          <TextField
            resizable={false}
            required={props.fieldDescription.required}
            disabled={props.editMode !== true}
            value={textValue}
            multiline
            autoAdjustHeight
            onBlur={(ev) => {
              try {
                const newVal = JSON.parse(textValue);
                props.onValueChanged(props.fieldDescription, newVal);
              } catch {}
            }}
            onChange={(ev, value) => {
              setTextValue(value);
            }}
          />
        </>
      )}

      <JsonTree data={props.fieldValue} />
    </>
  );
};
