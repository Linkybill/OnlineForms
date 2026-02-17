export interface OperationValidationRule {
  operationName: string;
  minNumberOfParameters: number | undefined;
  maxNumberOfParameters: number | undefined;
  returnTypeName: LogicParameterType;
  helpText: string;
  url?: string;
  expectedParameters: LogicParameter[];
  expectedParametersTemplate?: LogicParameter;
  parameterPickerResolutionInformationCanBeFoundAtParameterIndex?: number;
  parameterPickerResolutionShouldApplyForParameters?: number[];
  parameterPickerResolutionStopsRecursion?: boolean;
  modelIsInvalid?: boolean;
}

export interface LogicParameter {
  type: LogicParameterType;

  description: string;
}

export type LogicParameterType = "null" | "undefined" | "date" | "string" | "number" | "boolean" | "array" | "any" | "void";
