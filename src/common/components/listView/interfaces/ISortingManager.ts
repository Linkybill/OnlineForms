import { OrderByField } from "../models/OrderByField";

export interface ISortingManager {
  addSorting(fieldName: string, ascending: boolean): void;
  removeSorting(columnName: string): void;
  getSortings(): OrderByField[];
  isFieldSortedAscending(columnName: string): boolean;
  isFieldSortedDescending(columnName: string): boolean;
}
