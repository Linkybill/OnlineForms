import log from "loglevel";
import { parseString } from "xml2js";
export const MapXmlSchemaToColumnWidth = async (schema: string): Promise<{ [fieldName: string]: number }> => {
  const widthGroupedByFieldName: { [fieldName: string]: number } = {};

  await parseString("<root>" + schema + "</root>", (err, result) => {
    log.debug(result);
    result.root.FieldRef.forEach((fieldRef) => {
      widthGroupedByFieldName[fieldRef.$.Name] = fieldRef.$.width;
    });
    log.debug("MapXmlSchemaToColumnWidths: parsed columnwidths", result, widthGroupedByFieldName);
  });

  return widthGroupedByFieldName;
};
