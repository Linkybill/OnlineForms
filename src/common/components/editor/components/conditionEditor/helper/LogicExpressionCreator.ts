import { OperationValidationRule } from "../Models/OperationValidationModel";
import { LogicExpressionType } from "../types/LogicTypes";

export const CreateLogicExpressionBasedOnOperationValidation = (logicRule: OperationValidationRule): LogicExpressionType => {
  const key = logicRule.operationName;

  const objectToReturn: any = {};
  objectToReturn[key] = [];
  logicRule.expectedParameters.forEach((p) => {
    objectToReturn[key].push(null);
  });

  return objectToReturn;
};
