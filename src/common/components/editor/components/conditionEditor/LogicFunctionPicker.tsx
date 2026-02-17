import { Dropdown } from "@fluentui/react";
import React from "react";
import { LogicParameterType, OperationValidationRule } from "./Models/OperationValidationModel";
import { registeredLogicFunctionChoiceDropDowns } from "./Models/RegisteredLogicFunctions";

export const LogicFunctionPicker = (props: { filterForReturnType: LogicParameterType; selectedFunction: string; onFunctionSelected: (option: OperationValidationRule | undefined) => void }): JSX.Element => {
  var returnTypeFilter: string | undefined = props.filterForReturnType == "any" ? undefined : props.filterForReturnType;
  let optionsToUse =
    returnTypeFilter !== undefined
      ? registeredLogicFunctionChoiceDropDowns.filter((o) => o.data === undefined || o.data.returnTypeName === returnTypeFilter || o.data.returnTypeName === "any")
      : registeredLogicFunctionChoiceDropDowns;

  return (
    <Dropdown
      dropdownWidth={200}
      selectedKey={props.selectedFunction}
      options={optionsToUse}
      onChange={(ev, option) => {
        props.onFunctionSelected(option?.data);
      }}></Dropdown>
  );
};
