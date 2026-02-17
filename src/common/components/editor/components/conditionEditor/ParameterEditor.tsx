import React, { useState } from "react";
import { LogicEditorProxy } from "./LogicEditorProxy";
import { LogicParameterType, OperationValidationRule } from "./Models/OperationValidationModel";
import { LogicExpressionType } from "./types/LogicTypes";
import { FlexTable } from "../../../../actions/components/flexTable/FlexTable";
import { FlexRow } from "../../../../actions/components/flexTable/FlexRow";
import { FlexCell } from "../../../../actions/components/flexTable/FlexCell";
import { WithHelpText } from "../../../helpComponent/withHelpText";
import { ActionButton } from "@fluentui/react";
import { ModalWithCloseButton } from "../../../modals/ModalWithCloseButton";
import { LogicFunctionPicker } from "./LogicFunctionPicker";
import { CreateLogicExpressionBasedOnOperationValidation } from "./helper/LogicExpressionCreator";
import { ParameterPickerResolutionContextProvider } from "./ParameterPickerResolutionContext";
import { ParameterInformationContextProvider } from "./ParameterInformationContext";

interface ParameterUIHelper {
  canDelete: boolean;
  expectedReturnType: LogicParameterType;
  parameterHelpText: string;
  parameterData: LogicExpressionType | string | boolean | number | null;
}

export const ParameterEditor = (props: {
  onParameterUpdated: (updatedParams: (LogicExpressionType | string | boolean | number | null)[]) => void;
  validationModelForFunction: OperationValidationRule;
  givenParameters: (LogicExpressionType | string | boolean | number | null)[];
  /**
   * ✅ NEU: die komplette Expression der Funktion, deren Parameter hier editiert werden.
   * Beispiel: { filter: [ <arrayExpr>, <predicateExpr> ] }
   */
  parentLogicExpression: LogicExpressionType;
}): JSX.Element => {
  const [showAddParameter, setShowAddParameter] = useState(false);

  const functionExpectsParameters =
    props.validationModelForFunction.minNumberOfParameters > 0 || (props.validationModelForFunction.minNumberOfParameters == 0 && props.validationModelForFunction.maxNumberOfParameters === undefined);

  if (functionExpectsParameters === false) {
    return <>()</>;
  }

  const givenParameters = [...props.givenParameters];
  if (props.validationModelForFunction.expectedParameters.length < givenParameters.length) {
    props.validationModelForFunction.expectedParameters.forEach((expectedParameter, index) => {
      if (givenParameters.length - 1 < index) {
        givenParameters.push(null);
      }
    });
  }

  const propertiesOnRightSide = props.givenParameters;

  return (
    <>
      {showAddParameter === true && (
        <ModalWithCloseButton
          isOpen={true}
          title="Neuen Parameter hinzufügen"
          onClose={() => {
            setShowAddParameter(false);
          }}>
          <LogicFunctionPicker
            selectedFunction=""
            filterForReturnType="any"
            onFunctionSelected={(option) => {
              const selectedOperation = CreateLogicExpressionBasedOnOperationValidation(option);
              const newOptions = [...givenParameters, selectedOperation];
              props.onParameterUpdated(newOptions);
              setShowAddParameter(false);
            }}
          />
        </ModalWithCloseButton>
      )}

      {givenParameters.map((p, index): JSX.Element => {
        let expectedReturnType: LogicParameterType = "any";
        let parameterHelpText = "";
        let parameterCanBeDeleted = true;
        const parameterCanBeAdded = props.validationModelForFunction.maxNumberOfParameters === undefined && index == givenParameters.length - 1;
        let shouldWrapContentInParameterInformationContext = false;

        if (props.validationModelForFunction?.expectedParameters.length > index) {
          expectedReturnType = props.validationModelForFunction.expectedParameters[index].type;
          parameterHelpText = props.validationModelForFunction.expectedParameters[index].description;
          parameterCanBeDeleted = false;
          shouldWrapContentInParameterInformationContext = true;
        } else {
          if (props.validationModelForFunction?.expectedParametersTemplate !== undefined) {
            shouldWrapContentInParameterInformationContext = true;
            expectedReturnType = props.validationModelForFunction.expectedParametersTemplate.type;
            parameterHelpText = props.validationModelForFunction.expectedParametersTemplate.description;
          }
        }

        let content = (
          <FlexTable key={"flexTable_" + index}>
            <FlexRow>
              <FlexCell className="content">
                <WithHelpText iconName="AdminPLogoInverse32" title={"Parameter " + index} shouldShowHelpText={parameterHelpText !== ""} classIdentifier="functionHelp" helpText={parameterHelpText} />
              </FlexCell>

              <FlexCell>
                <FlexTable>
                  <FlexRow>
                    <FlexCell>
                      <LogicEditorProxy
                        expressionShouldProduceType={expectedReturnType}
                        logicExpression={p}
                        onLogicUpdated={(newPropertyExpression) => {
                          propertiesOnRightSide[index] = newPropertyExpression;
                          props.onParameterUpdated([...propertiesOnRightSide]);
                        }}
                      />
                    </FlexCell>

                    {parameterCanBeDeleted == true && (
                      <FlexCell>
                        <ActionButton
                          iconProps={{ iconName: "Delete" }}
                          text="Löschen"
                          onClick={() => {
                            const newArray = givenParameters.filter((_, i) => index !== i);
                            props.onParameterUpdated(newArray);
                          }}
                        />
                      </FlexCell>
                    )}
                  </FlexRow>

                  {parameterCanBeAdded === true && (
                    <FlexRow>
                      <FlexCell>
                        <ActionButton
                          iconProps={{ iconName: "Add" }}
                          text="Parameter hinzufügen"
                          onClick={() => {
                            setShowAddParameter(true);
                          }}
                        />
                      </FlexCell>
                    </FlexRow>
                  )}
                </FlexTable>
              </FlexCell>
            </FlexRow>
          </FlexTable>
        );

        // (A) Parameter-Infos (dein bestehender Context)
        if (shouldWrapContentInParameterInformationContext === true) {
          content = <ParameterInformationContextProvider expectedType={expectedReturnType}>{content}</ParameterInformationContextProvider>;
        }

        // (B) ✅ Picker-Resolution rekursiv: wenn diese Funktion das verlangt
        if (
          props.validationModelForFunction.parameterPickerResolutionInformationCanBeFoundAtParameterIndex !== undefined &&
          props.validationModelForFunction.parameterPickerResolutionShouldApplyForParameters !== undefined &&
          props.validationModelForFunction.parameterPickerResolutionShouldApplyForParameters.indexOf(index) > -1
        ) {
          content = (
            <ParameterPickerResolutionContextProvider parentExpression={props.parentLogicExpression} parentFunctionRule={props.validationModelForFunction} currentParameterIndex={index}>
              {content}
            </ParameterPickerResolutionContextProvider>
          );
        }

        return content;
      })}
    </>
  );
};
