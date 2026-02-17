import React, { useContext } from "react";
import { LogicParameterType } from "./Models/OperationValidationModel";

interface IParameterInformationContextAccessor {
  expectedParameterType: LogicParameterType;
}

export const ParameterInformationContext = React.createContext<IParameterInformationContextAccessor>({
  expectedParameterType: "any"
});

export const useParameterInformationContext = () => useContext(ParameterInformationContext);

export const ParameterInformationContextProvider = (props: { expectedType: LogicParameterType; children: JSX.Element }) => {
  return (
    <>
      <ParameterInformationContext.Provider value={{ expectedParameterType: props.expectedType }}>{props.children}</ParameterInformationContext.Provider>
    </>
  );
};
