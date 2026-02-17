import { Checkbox, DefaultButton, IContextualMenuProps, SpinButton, TextField } from "@fluentui/react";
import React, { useState } from "react";
import { LogicExpressionType } from "./types/LogicTypes";
import { LogicParameterType, OperationValidationRule } from "./Models/OperationValidationModel";
import { getLogicOperationValidationModel } from "./Models/RegisteredLogicFunctions";
import { ModalWithCloseButton } from "../../../modals/ModalWithCloseButton";
import { LogicFunctionPicker } from "./LogicFunctionPicker";
import { CreateLogicExpressionBasedOnOperationValidation } from "./helper/LogicExpressionCreator";
import { ParameterEditor } from "./ParameterEditor";
import { WithHelpText } from "../../../helpComponent/withHelpText";
import { WithErrorsBottom } from "../../../errorComponent/WithErrorsBottom";
import { ParameterPickerLoadingOptions } from "../ParameterPicker/ParameterPickerV2";
import { TextFieldWithParameterPicker } from "../html/TextFieldWithParameterPicker";

export const LogicExpressionItemEditor = (props: {
  showFunctionsOnly?: boolean;
  logicExpression: LogicExpressionType | string | number | boolean | null;
  expressionShouldProduceType: LogicParameterType;
  calledByFunctionName?: string;
  onLogicUpdated: (logicObject: LogicExpressionType | undefined | null | string | number | boolean) => void;
}) => {
  const [textInputVisible, setTextInputVisible] = useState<boolean>(false);
  const [numberInputVisible, setNumberInputVisible] = useState<boolean>(false);
  const [booleanInputVisible, setBooleanInputVisible] = useState<boolean>(false);
  const [functionInputVisible, setFunctionInputVisible] = useState<boolean>(false);

  let validationModelForFunction: OperationValidationRule | undefined = undefined;

  let displayValueForLeftside: number | string | boolean = "";
  let selectedKeyForFunctionPicker = "";
  let propertiesOnRightSide: (LogicExpressionType | string | boolean | number | null)[] = [];
  let valueForTextInput: string | number | boolean = "";

  const isFunctionExpression =
    props.logicExpression !== undefined && props.logicExpression !== null && typeof props.logicExpression !== "string" && typeof props.logicExpression !== "boolean" && typeof props.logicExpression !== "number";

  if (isFunctionExpression) {
    displayValueForLeftside = Object.keys(props.logicExpression)[0];
    selectedKeyForFunctionPicker = displayValueForLeftside as any;
    propertiesOnRightSide = (props.logicExpression as any)[selectedKeyForFunctionPicker];
    if (!Array.isArray(propertiesOnRightSide)) {
      return <>Funktion nicht gültig bzw. unbekannt. Kann nur im Texteditor bearbeitet werden</>;
    }
    validationModelForFunction = getLogicOperationValidationModel(selectedKeyForFunctionPicker);
  } else {
    valueForTextInput = props.logicExpression as unknown as string | number | boolean;
    displayValueForLeftside = props.logicExpression as number | string | boolean;
  }

  if (props.logicExpression === null) {
    displayValueForLeftside = "null";
  }
  if (valueForTextInput === null || valueForTextInput === undefined) {
    valueForTextInput = "";
  }

  const compatibleTypesForNumber: LogicParameterType[] = ["number", "any"];
  const compatibleTypesForText: LogicParameterType[] = ["string", "any"];
  const compatibleTypesForBoolean: LogicParameterType[] = ["boolean", "any"];

  const menuProps: IContextualMenuProps = {
    title: "",
    items: []
  };

  if (props.showFunctionsOnly !== true) {
    if (compatibleTypesForNumber.indexOf(props.expressionShouldProduceType) > -1) {
      menuProps.items.push({
        key: "numberValue",
        text: "Nummernwert festlegen",
        onClick: () => {
          setNumberInputVisible(true);
        }
      });
    }

    if (compatibleTypesForText.indexOf(props.expressionShouldProduceType) > -1) {
      menuProps.items.push({
        key: "textValue",
        text: "Text als Wert festlegen",
        onClick: () => {
          setTextInputVisible(true);
        }
      });
    }

    if (compatibleTypesForBoolean.indexOf(props.expressionShouldProduceType) > -1) {
      menuProps.items.push({
        key: "booleanValue",
        text: "Booleanwert festlegen",
        onClick: () => {
          setBooleanInputVisible(true);
        }
      });
    }
    menuProps.items.push({
      key: "undefined",
      text: "undefined-Wert festlegen",
      onClick: () => {
        props.onLogicUpdated(undefined);
      }
    });
  }

  menuProps.items.push({
    key: "createFunction",
    text: "Funktion benutzen",
    onClick: () => {
      setFunctionInputVisible(true);
    }
  });

  return (
    <>
      {textInputVisible && (
        <ModalWithCloseButton
          isOpen={true}
          title="Textwert festlegen"
          onClose={() => {
            setTextInputVisible(false);
          }}>
          <TextField
            label="Textwert festlegen"
            value={valueForTextInput.toString()}
            onChange={(ev, val) => {
              props.onLogicUpdated(val);
            }}
          />
        </ModalWithCloseButton>
      )}

      {numberInputVisible && (
        <ModalWithCloseButton
          isOpen={true}
          title="Nummernwert festlegen"
          onClose={() => {
            setNumberInputVisible(false);
          }}>
          <SpinButton
            label="Nummernwert festlegen"
            value={valueForTextInput.toString()}
            onChange={(ev, val) => {
              props.onLogicUpdated(val ? Number(val) : 0);
            }}
          />
        </ModalWithCloseButton>
      )}

      {booleanInputVisible && (
        <ModalWithCloseButton
          isOpen={true}
          title="Booleanwert festlegen"
          onClose={() => {
            setBooleanInputVisible(false);
          }}>
          <Checkbox
            label="Booleanwert festlegen"
            checked={Boolean(valueForTextInput)}
            onChange={(ev, checked) => {
              props.onLogicUpdated(checked);
            }}
          />
        </ModalWithCloseButton>
      )}

      {functionInputVisible && (
        <ModalWithCloseButton
          isOpen={true}
          title="Funktion benutzen"
          onClose={() => {
            setFunctionInputVisible(false);
          }}>
          <LogicFunctionPicker
            filterForReturnType={props.expressionShouldProduceType}
            onFunctionSelected={(pickedFunction) => {
              const newExpression = CreateLogicExpressionBasedOnOperationValidation(pickedFunction);
              props.onLogicUpdated(newExpression);
            }}
            selectedFunction={selectedKeyForFunctionPicker}
          />
        </ModalWithCloseButton>
      )}

      <div className="flexTable">
        <div className="flexRow">
          <div className="flexCell content">
            <WithHelpText
              classIdentifier="functionHelp"
              shouldShowHelpText={validationModelForFunction !== undefined}
              title="Funktionshilfe"
              key={"functionHelp"}
              helpText={validationModelForFunction !== undefined ? validationModelForFunction.helpText : ""}>
              <WithErrorsBottom errors={validationModelForFunction !== undefined && validationModelForFunction.modelIsInvalid === true ? ["Die Funktion ist ungültig, bitte korrigieren"] : []}>
                <DefaultButton text={displayValueForLeftside.toString()} menuProps={menuProps} />
              </WithErrorsBottom>
            </WithHelpText>
          </div>

          {validationModelForFunction !== undefined && (
            <div className={"flexCell content"}>
              {displayValueForLeftside === "var" ? (
                <TextFieldWithParameterPicker
                  label=""
                  pathDelimiter="."
                  pathShouldStartWithDelimiter={false}
                  value={propertiesOnRightSide[0] as string}
                  onApprove={(selectedParameter) => {
                    const newProps = [selectedParameter];
                    props.onLogicUpdated({ var: newProps });
                  }}
                  parameterLoadingOptions={ParameterPickerLoadingOptions.FormFields | ParameterPickerLoadingOptions.DatasourceResults}
                />
              ) : (
                <ParameterEditor
                  // ✅ WICHTIG: Parent-Expression an ParameterEditor geben (damit rekursives Resolution funktioniert)
                  parentLogicExpression={props.logicExpression as LogicExpressionType}
                  givenParameters={propertiesOnRightSide}
                  validationModelForFunction={validationModelForFunction}
                  onParameterUpdated={(changedParams) => {
                    const newExpression = props.logicExpression as any;
                    const firstKey = Object.keys(newExpression)[0];
                    newExpression[firstKey] = [...changedParams];
                    props.onLogicUpdated(newExpression);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
