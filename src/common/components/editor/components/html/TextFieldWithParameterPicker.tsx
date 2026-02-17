import { ActionButton, TextField } from "@fluentui/react";
import React, { useEffect, useState } from "react";

import { ModalWithCloseButton } from "../../../modals/ModalWithCloseButton";
import { formatParameterPathToHtmlTemplate } from "./HtmlTemplateHelper";
import { ParameterPickerLoadingOptions, ParameterPickerV2 } from "../ParameterPicker/ParameterPickerV2";

export const TextFieldWithParameterPicker = (props: {
  parameterLoadingOptions: ParameterPickerLoadingOptions;
  label: string;
  value: string;
  pathDelimiter: string;
  pathShouldStartWithDelimiter: boolean;
  onApprove: (value: string) => void;
}) => {
  const [parameterPickerVisible, setParameterPickerVisible] = useState<boolean>(false);
  const [valueForTextField, setValueForTextField] = useState<string>(props.value);

  useEffect(() => {
    setValueForTextField(props.value);
  }, [props.value]);
  const closeParameterPicker = () => {
    setParameterPickerVisible(false);
  };

  return (
    <>
      {parameterPickerVisible === true && (
        <>
          <ModalWithCloseButton
            styles={{
              main: {
                width: 400
              }
            }}
            isOpen={true}
            title="Parameter auswählen"
            onClose={() => closeParameterPicker()}>
            <ParameterPickerV2
              pathShouldStartWithDelimiter={props.pathShouldStartWithDelimiter}
              pathDelimiter={props.pathDelimiter}
              parameterLoadingOptions={props.parameterLoadingOptions}
              onParameterPicked={(path, parameter) => {
                const placeHolder = formatParameterPathToHtmlTemplate(path);

                props.onApprove(path);

                closeParameterPicker();
              }}
              selectedPath=""
            />
          </ModalWithCloseButton>
        </>
      )}
      <TextField
        onChange={(ev, val) => {
          var test = 0;
          setValueForTextField(val);
        }}
        onBlur={(ev): void => {
          props.onApprove(valueForTextField);
        }}
        label={props.label}
        value={valueForTextField}
        onRenderSuffix={() => {
          return (
            <ActionButton
              text="Parameter"
              onClick={() => {
                setParameterPickerVisible(true);
              }}></ActionButton>
          );
        }}
      />
    </>
  );
};
