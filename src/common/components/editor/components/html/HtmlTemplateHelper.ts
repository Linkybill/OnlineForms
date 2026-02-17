export const formatParameterPathToHtmlTemplate = (parameterPath: string): string => {
  let placeHolder = "{" + parameterPath.replace("listItem.", "") + "}";
  placeHolder = placeHolder.replace("listItem.", "").replace(/\./g, "");
  return placeHolder;
};
