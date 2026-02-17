import React, { createContext, useContext, useMemo } from "react";
import type { OperationValidationRule } from "./Models/OperationValidationModel";
import { resolvePickerRestrictionRecursively } from "./JsonLogicParameterReolution";

export interface ParameterPickerResolutionContextValue {
  pathWhereInfosSchouldGetLoadedFrom?: string;
  restrictionComesFromArrayParameter?: boolean;
  fallbackLeafName?: string;
  sourceFunctionName?: string;
  sourceParameterPath?: string;
}

const ParameterPickerResolutionContext = createContext<ParameterPickerResolutionContextValue>({
  pathWhereInfosSchouldGetLoadedFrom: undefined,
  restrictionComesFromArrayParameter: undefined
});

export const useParameterPickerResolutionContext = (): ParameterPickerResolutionContextValue => {
  return useContext(ParameterPickerResolutionContext);
};

export const ParameterPickerResolutionContextProvider = (props: {
  parentExpression: any; // das Expression-Objekt der Funktion (z.B. {filter:[...]} / {map:[...]} etc.)
  parentFunctionRule: OperationValidationRule; // Validation-Model der Funktion
  currentParameterIndex: number; // welcher Parameter wird gerade editiert
  children: React.ReactNode;
}): JSX.Element => {
  const value = useMemo<ParameterPickerResolutionContextValue>(() => {
    const res = resolvePickerRestrictionRecursively(props.parentExpression, props.parentFunctionRule, props.currentParameterIndex);

    // wenn nichts ableitbar -> Context leer lassen
    if (!res.restrictionPath) {
      return {
        pathWhereInfosSchouldGetLoadedFrom: undefined,
        restrictionComesFromArrayParameter: undefined,
        fallbackLeafName: undefined
      };
    }

    return {
      pathWhereInfosSchouldGetLoadedFrom: res.restrictionPath,
      restrictionComesFromArrayParameter: res.restrictionComesFromArray,
      fallbackLeafName: res.fallbackLeafName,
      sourceFunctionName: res.sourceFunctionName,
      sourceParameterPath: res.sourceParameterPath
    };
  }, [props.parentExpression, props.parentFunctionRule, props.currentParameterIndex]);

  return <ParameterPickerResolutionContext.Provider value={value}>{props.children}</ParameterPickerResolutionContext.Provider>;
};
