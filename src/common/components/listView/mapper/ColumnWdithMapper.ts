import log from "loglevel";
import { XMLParser } from "fast-xml-parser";
export const MapXmlSchemaToColumnWidth = async (schema: string): Promise<{ [fieldName: string]: number }> => {
  const widthGroupedByFieldName: { [fieldName: string]: number } = {};

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    allowBooleanAttributes: true
  });

  const result = parser.parse("<root>" + schema + "</root>");
  log.debug(result);

  const fieldRefs = result?.root?.FieldRef;
  const fieldRefArray = Array.isArray(fieldRefs) ? fieldRefs : fieldRefs ? [fieldRefs] : [];
  fieldRefArray.forEach((fieldRef) => {
    const name = fieldRef?.["@_Name"];
    const width = fieldRef?.["@_width"];
    if (name !== undefined) {
      widthGroupedByFieldName[name] = width !== undefined ? Number(width) : undefined;
    }
  });
  log.debug("MapXmlSchemaToColumnWidths: parsed columnwidths", result, widthGroupedByFieldName);

  return widthGroupedByFieldName;
};
