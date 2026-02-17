import React, { useEffect, useRef, useState } from "react";
import { LogicParameterType } from "./Models/OperationValidationModel";

import { Dropdown, IDropdownOption, TextField } from "@fluentui/react";

export const ExpressionValueEditorField = (props: { conditionShouldReturnType: LogicParameterType; value: string | boolean | number; onValueChanged: (changedValue: string | boolean | number) => void }) => {
  const [valueForTextBox, setValueForTextBox] = useState<string>("");

  const compatibleTypesForText: LogicParameterType[] = ["string", "any"];
  const compatibleTypesForNumberField: LogicParameterType[] = ["number", "any"];
  const compatibleTypesForBooleanField: LogicParameterType[] = ["boolean", "any"];

  const valueDidChange = useRef<boolean>(false);
  useEffect(() => {
    setValueForTextBox(props.value.toString());
  }, [props.value]);

  const handleValueChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    if (newValue !== undefined) {
      setValueForTextBox(newValue);
      valueDidChange.current = true;
    }
  };

  const handleDropdownChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option) {
      setValueForTextBox(option.key as string);
    }
  };

  const handleBlur = () => {
    if (valueDidChange.current) {
      valueDidChange.current = false;
      let parsedValue: string | number | boolean = valueForTextBox;
      if (props.conditionShouldReturnType === "number") {
        const numberValue = parseFloat(valueForTextBox);
        if (!isNaN(numberValue)) {
          parsedValue = numberValue;
        } else {
          parsedValue = 0; // Default value or handle invalid input as needed
        }
      } else if (props.conditionShouldReturnType === "boolean") {
        parsedValue = valueForTextBox.toLowerCase() === "true";
      }
      props.onValueChanged(parsedValue as any);
    }
  };

  return (
    <div>
      {compatibleTypesForText.includes(props.conditionShouldReturnType) && (
        <TextField
          label="String Value"
          value={valueForTextBox}
          onChange={handleValueChange}
          onBlur={handleBlur}
          styles={{ root: { marginBottom: 10 } }} // Fügt einen Abstand zwischen den Komponenten hinzu
        />
      )}
      {compatibleTypesForNumberField.includes(props.conditionShouldReturnType) && (
        <TextField
          label="Number Value"
          value={valueForTextBox}
          onChange={handleValueChange}
          onBlur={handleBlur}
          type="number"
          styles={{ root: { marginBottom: 10 } }} // Fügt einen Abstand zwischen den Komponenten hinzu
        />
      )}
      {compatibleTypesForBooleanField.includes(props.conditionShouldReturnType) && (
        <Dropdown
          label="Boolean Value"
          selectedKey={valueForTextBox}
          onChange={handleDropdownChange}
          onBlur={handleBlur}
          options={[
            { key: "true", text: "True" },
            { key: "false", text: "False" }
          ]}
          styles={{ root: { marginBottom: 10 } }} // Fügt einen Abstand zwischen den Komponenten hinzu
        />
      )}
    </div>
  );
};
