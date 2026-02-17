import { useState } from "react";
import { ActionButton, IconButton, Label, TextField } from "@fluentui/react";
import log from "loglevel";
import * as React from "react";
import { IFieldComponentProps } from "../base/FieldComponentProps";
import { WebPickerFieldDescription } from "./WebPickerFieldDescription";
import { WebPicker } from "../../../components/picker/components/WebPicker";

export interface IWebPickerFieldProps extends IFieldComponentProps<WebPickerFieldDescription, string | undefined> {}

export const WebPickerField = (props: IWebPickerFieldProps): JSX.Element => {
  return (
    <>
      <WebPicker
        editMode={props.editMode}
        onSelectionApproved={(selectedWebs) => {
          props.onValueChanged(props.fieldDescription, selectedWebs.length > 0 ? (selectedWebs[0].Id as unknown as string) : undefined);
        }}
        allowMultipleSelections={false}
        label={props.fieldDescription.displayName}
        selectedWebIds={props.fieldValue !== undefined && props.fieldValue.length > 0 ? [props.fieldValue] : []}></WebPicker>
    </>
  );
};
