import React from "react";
import { LogicExpressionType } from "./types/LogicTypes";
import { ActionButton, ChoiceGroup } from "@fluentui/react";
import { LogicEditorProxy } from "./LogicEditorProxy";
import { LogicParameterType } from "./Models/OperationValidationModel";
import { LogicFunctionPicker } from "./LogicFunctionPicker";
import { CreateLogicExpressionBasedOnOperationValidation } from "./helper/LogicExpressionCreator";
import { useUILogger } from "../../../../logging/UseUiLogger";

export const LogicRootEditor = (props: {
  expressionShouldProducetype: LogicParameterType;
  logicExpression: LogicExpressionType | undefined;
  onLogicUpdated: (logicObject: LogicExpressionType | null) => void;
}): JSX.Element => {
  return (
    <>
      {props.logicExpression === undefined || props.logicExpression === null ? (
        <>
          <LogicFunctionPicker
            filterForReturnType={props.expressionShouldProducetype}
            selectedFunction={""}
            onFunctionSelected={(addedOption) => {
              const newLogicObject = CreateLogicExpressionBasedOnOperationValidation(addedOption);
              props.onLogicUpdated(newLogicObject);
            }}
          />
        </>
      ) : (
        <>
          <LogicEditorProxy
            showFunctionsOnly={true}
            expressionShouldProduceType={props.expressionShouldProducetype}
            logicExpression={props.logicExpression}
            onLogicUpdated={(newVal) => {
              props.onLogicUpdated(newVal as LogicExpressionType);
            }}
          />
          <ActionButton
            text="Löschen"
            iconProps={{ iconName: "Delete" }}
            onClick={() => {
              props.onLogicUpdated(undefined);
            }}
          />
        </>
      )}
    </>
  );
};
