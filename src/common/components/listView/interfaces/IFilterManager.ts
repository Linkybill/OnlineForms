import { Filter } from "../../../dynamicFilter/models/Filter";

export interface IFilterManager {
  addFilter(columnName: string, filterValue: string, fieldType: string): void;
  removeFilter(columnName: string, filterValue: string): void;
  clearFilterOnColumn(fieldName: string): void;
  getCurrentFilter(): Filter[];
  getCurrentFilterForColumn(columnName: string): string[];
  isFieldFiltered(fieldName: string): boolean;
  setFilter(filter: Filter[]): void;
}
