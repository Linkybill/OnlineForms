import { useRef } from "react";
import { ISortingManager } from "../interfaces/ISortingManager";
import { OrderByField } from "../models/OrderByField";

export function useSorting(onSortingChanged: () => void): ISortingManager {
  const sortColumn = useRef<OrderByField | undefined>();

  const getSortFields = (): OrderByField[] => {
    return sortColumn.current !== undefined ? [sortColumn.current] : [];
  };
  return {
    isFieldSortedAscending: (columnName: string): boolean => {
      return (
        sortColumn.current !== undefined &&
        sortColumn.current.fieldName === columnName &&
        sortColumn.current.ascending
      );
    },
    isFieldSortedDescending: (columnName: string): boolean => {
      return (
        sortColumn.current !== undefined &&
        sortColumn.current.fieldName === columnName &&
        sortColumn.current.ascending === false
      );
    },
    addSorting: (columnName: string, ascending: boolean): void => {
      const filterChanged =
        sortColumn.current === undefined ||
        sortColumn.current.ascending !== ascending ||
        sortColumn.current.fieldName !== columnName;

      if (filterChanged) {
        sortColumn.current = {
          fieldName: columnName,
          ascending: ascending,
        };

        onSortingChanged();
      }
    },
    removeSorting: (): void => {
      if (sortColumn.current !== undefined) {
        sortColumn.current = undefined;
        onSortingChanged();
      }
    },
    getSortings: (): OrderByField[] => {
      return getSortFields();
    },
  };
}
