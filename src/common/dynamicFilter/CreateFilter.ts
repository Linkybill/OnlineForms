import log from "loglevel";
import { LookupValue } from "../listItem/fields/valueTypes/LookupValue";
import { ListItem } from "../listItem/ListItem";
import { Filter } from "./models/Filter";
import { FilterConfig } from "./models/FilterConfig";

export const createFilter = (config: FilterConfig, data: ListItem[]): Filter => {
  let values: string[] = [];
  data.forEach((item) => {
    const itemValue: any = item.getProperty(config.sourceFieldName).value;
    log.debug("going to create filter value from ", {
      item: item,
      filterConfig: config
    });
    if (config.fieldType === "Lookup") {
      const lookups = itemValue as LookupValue[];
      if (lookups.length > 0) {
        const lookupValuesAsStringValues = mapLookupValueToStringValue(itemValue);
        lookupValuesAsStringValues.forEach((val) => values.push(val));
      }
    } else {
      values.push(itemValue);
    }
  });

  const filter: Filter = {
    fieldName: config.targetFieldName,
    values: values,
    fieldType: config.fieldType
  };
  log.debug("created filter: ", filter);
  return filter;
};
function mapLookupValueToStringValue(itemValue: LookupValue[]): string[] {
  const stringValues: string[] = [];

  itemValue.forEach((val) => stringValues.push(val.value));

  return stringValues;
}
