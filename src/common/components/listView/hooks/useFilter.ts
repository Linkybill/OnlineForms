import { useRef } from "react";
import { removeItemFromArray } from "../helper/ArrayHelper";
import { IFilterManager } from "../interfaces/IFilterManager";
import { Filter } from "../../../dynamicFilter/models/Filter";
import { FieldTypeNames } from "../../../listItem/FieldTypeNames";

export function useFilter(onFilterChanged: () => void): IFilterManager {
  const filteredColumnNames = useRef<string[]>([]);
  const filterGroupedByColumnName = useRef<{
    [columnName: string]: Filter | undefined;
  }>({});

  function getCurrentFilter(): Filter[] {
    const notUndefinedFilters = filteredColumnNames.current.filter((name) => filterGroupedByColumnName.current[name] !== undefined);
    return notUndefinedFilters.map((column): Filter => {
      return filterGroupedByColumnName.current[column] as Filter;
    });
  }

  function addFilter(columnName: string, filterValue: string, fieldType: string): void {
    if (filterGroupedByColumnName.current[columnName] === undefined) {
      filterGroupedByColumnName.current[columnName] = {
        fieldType: fieldType,
        fieldName: columnName,
        values: []
      };
      filteredColumnNames.current.push(columnName);
    }
    // todo: remove as Filter: Compiler throws error: Possibly undefined, but here it can not be undefined case it is defently being initialized above.
    if ((filterGroupedByColumnName.current[columnName] as Filter).values.indexOf(filterValue) === -1) {
      (filterGroupedByColumnName.current[columnName] as Filter).values.push(filterValue);
    }
  }

  return {
    addFilter: (columnName: string, filterValue: string, fieldType: string): void => {
      // todo: remove as Filter: Compiler throws error: Possibly undefined, but here it can not be undefined case it is defently being initialized above.
      addFilter(columnName, filterValue, fieldType);
      onFilterChanged();
    },
    clearFilterOnColumn: (columnName: string): void => {
      filterGroupedByColumnName.current[columnName] = undefined;
      filteredColumnNames.current = removeItemFromArray(filteredColumnNames.current, columnName);
      onFilterChanged();
    },
    getCurrentFilter: (): Filter[] => {
      return getCurrentFilter();
    },
    isFieldFiltered: (fieldName: string): boolean => {
      return filteredColumnNames.current.indexOf(fieldName) > -1;
    },
    removeFilter: (columnName: string, filterValue: string): void => {
      // todo : remove castings....
      if (filterGroupedByColumnName.current[columnName] !== undefined) {
        (filterGroupedByColumnName.current[columnName] as Filter).values = removeItemFromArray((filterGroupedByColumnName.current[columnName] as Filter).values, filterValue);

        if ((filterGroupedByColumnName.current[columnName] as Filter).values.length === 0) {
          removeItemFromArray(filteredColumnNames.current, columnName);

          filterGroupedByColumnName.current[columnName] = undefined;
          filteredColumnNames.current = removeItemFromArray(filteredColumnNames.current, columnName);
        }
      }
      onFilterChanged();
    },
    getCurrentFilterForColumn: (columnName: string): string[] => {
      // todo: remove castings
      return filterGroupedByColumnName.current[columnName] ? (filterGroupedByColumnName.current[columnName] as Filter).values : [];
    },
    setFilter: (filter: Filter[]): void => {
      // clear filter storage in constants:
      filteredColumnNames.current = [];
      filterGroupedByColumnName.current = {};
      // add filter
      filter.forEach((filter) => {
        filter.values.forEach((value) => {
          addFilter(filter.fieldName, value, filter.fieldType);
        });
      });
      // fire onchange
      onFilterChanged();
    }
  };
}
