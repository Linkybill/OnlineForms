import { isArray, isObject } from "lodash";
import { getLogicOperationValidationModel } from "./Models/RegisteredLogicFunctions";
import { OperationValidationRule } from "./Models/OperationValidationModel";

export interface ResolutionResult {
  restrictionPath: string | null;
  restrictionComesFromArray: boolean;
  fallbackLeafName?: string;
  sourceFunctionName?: string;
  sourceParameterPath?: string;
}

/**
 * Rekursiv: löst "Scope / Restriction-Path" über mehrere verschachtelte Funktionen hinweg.
 *
 * Beispiel:
 * filter(
 *   map({var:"datasources.X"}, ...),
 *   ...
 * )
 *
 * -> Resolver läuft von filter[0] (Array) weiter nach innen, bis er bei var landet.
 */
export const resolvePickerRestrictionRecursively = (parentExpression: any, parentFunctionRule: OperationValidationRule, currentParameterIndex: number): ResolutionResult => {
  // Wenn der aktuelle Parameter gar nicht "resolution-geführt" sein soll -> keine Restriktion
  if (
    parentFunctionRule.parameterPickerResolutionShouldApplyForParameters === undefined ||
    parentFunctionRule.parameterPickerResolutionShouldApplyForParameters.indexOf(currentParameterIndex) === -1 ||
    parentFunctionRule.parameterPickerResolutionInformationCanBeFoundAtParameterIndex === undefined
  ) {
    return { restrictionPath: null, restrictionComesFromArray: false };
  }

  // parentExpression ist das Expression-Objekt der Funktion (z.B. {filter:[...]} )
  if (!isObject(parentExpression)) return { restrictionPath: null, restrictionComesFromArray: false };

  const fnName = Object.keys(parentExpression)[0];
  const fnParams = parentExpression[fnName];

  if (!isArray(fnParams)) return { restrictionPath: null, restrictionComesFromArray: false };

  const scopeSourceIndex = parentFunctionRule.parameterPickerResolutionInformationCanBeFoundAtParameterIndex;
  if (scopeSourceIndex < 0 || fnParams.length <= scopeSourceIndex) {
    return { restrictionPath: null, restrictionComesFromArray: false };
  }

  const scopeExpression = fnParams[scopeSourceIndex];

  // 1) Wenn scopeExpression ein var ist -> fertig
  const varPath = tryExtractVarPath(scopeExpression);
  if (varPath !== null) {
    return { restrictionPath: varPath, restrictionComesFromArray: true };
  }

  // 2) Wenn scopeExpression eine Funktion ist -> rekursiv weiter
  const nested = tryExtractFunction(scopeExpression);
  if (nested) {
    if (nested.fnName === "map") {
      const mapResolution = tryResolveMapRestriction(scopeExpression);
      return mapResolution ?? { restrictionPath: null, restrictionComesFromArray: false };
    }

    const nestedRule = getLogicOperationValidationModel(nested.fnName);

    if (nestedRule.parameterPickerResolutionStopsRecursion === true) {
      return { restrictionPath: null, restrictionComesFromArray: false };
    }

    // Wenn nestedRule keine Resolution-Infos hat, können wir nicht weiter ableiten
    if (nestedRule.parameterPickerResolutionInformationCanBeFoundAtParameterIndex === undefined) {
      return { restrictionPath: null, restrictionComesFromArray: false };
    }

    // Wir wollen weiter rückwärts laufen -> wir nehmen irgendeinen Parameterindex,
    // für den Resolution gilt (typisch [1] bei map/filter/...).
    const assumedIndex = nestedRule.parameterPickerResolutionShouldApplyForParameters?.[0] ?? 1;

    const nestedResolution = resolvePickerRestrictionRecursively(scopeExpression, nestedRule, assumedIndex);
    if (nestedResolution?.sourceFunctionName === undefined) {
      return { ...nestedResolution, sourceFunctionName: nested.fnName };
    }
    return nestedResolution;
  }

  // 3) sonst: keine ableitbare Restriktion
  return { restrictionPath: null, restrictionComesFromArray: false };
};

const tryExtractVarPath = (expr: any): string | null => {
  if (!isObject(expr)) return null;
  if (!Object.prototype.hasOwnProperty.call(expr, "var")) return null;

  const v = (expr as any)["var"];

  if (typeof v === "string") return v;
  if (isArray(v) && v.length > 0 && typeof v[0] === "string") return v[0];

  return null;
};

const tryExtractFunction = (expr: any): { fnName: string; params: any[] } | null => {
  if (!isObject(expr)) return null;

  const keys = Object.keys(expr);
  if (keys.length !== 1) return null;

  const fnName = keys[0];
  const params = (expr as any)[fnName];

  if (!isArray(params)) return null;

  return { fnName, params };
};

const tryResolveMapRestriction = (mapExpression: any): ResolutionResult | null => {
  const fn = tryExtractFunction(mapExpression);
  if (!fn || fn.fnName !== "map") return null;
  if (!Array.isArray(fn.params) || fn.params.length < 2) return null;

  const baseResolution = resolveRestrictionFromExpression(fn.params[0]);
  if (!baseResolution || baseResolution.restrictionPath === null) return null;

  const mapBody = fn.params[1];
  const bodyVar = tryExtractVarPath(mapBody);
  if (bodyVar === null) {
    const nestedBodyFn = tryExtractFunction(mapBody);
    if (nestedBodyFn && nestedBodyFn.fnName === "createObject") {
      return null;
    }
    return null;
  }

  const leafName = bodyVar !== "" ? bodyVar.split(".").slice(-1)[0] : undefined;

  if (bodyVar === "") {
    return { restrictionPath: baseResolution.restrictionPath, restrictionComesFromArray: true };
  }

  const basePath = baseResolution.restrictionPath ?? "";
  const joinedPath = basePath !== "" ? `${basePath}.${bodyVar}` : bodyVar;
  return {
    restrictionPath: joinedPath,
    restrictionComesFromArray: true,
    fallbackLeafName: leafName,
    sourceFunctionName: "map",
    sourceParameterPath: baseResolution.restrictionPath ?? undefined
  };
};

const resolveRestrictionFromExpression = (expr: any): ResolutionResult | null => {
  const varPath = tryExtractVarPath(expr);
  if (varPath !== null) {
    return { restrictionPath: varPath, restrictionComesFromArray: true };
  }

  const fn = tryExtractFunction(expr);
  if (!fn) return null;

  const nestedRule = getLogicOperationValidationModel(fn.fnName);
  if (nestedRule.parameterPickerResolutionInformationCanBeFoundAtParameterIndex === undefined) {
    return null;
  }

  if (nestedRule.parameterPickerResolutionStopsRecursion === true) {
    return null;
  }

  const assumedIndex = nestedRule.parameterPickerResolutionShouldApplyForParameters?.[0] ?? 1;
  return resolvePickerRestrictionRecursively(expr, nestedRule, assumedIndex);
};
