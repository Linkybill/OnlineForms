import { IColumn } from "@fluentui/react";
import { FieldDescriptionTypes } from "../../../listItem/types/FieldDescriptionTypes";

export interface IGenericListManager {
  createColumns(
    listId: string,
    fields: FieldDescriptionTypes[],

    onColumnClick: undefined | ((ev: any, column: IColumn) => void),
    ascendingSortedFieldNames: string[],
    descendingSortedFieldNames: string[],
    filteredFieldNames: string[],
    columnWidths: { [fieldName: string]: number },
    onInlineDeleteClicked?: (item: ListItem) => void,
    onInlineEditClicked?: (item: ListItem) => void
  ): IColumn[];
}
