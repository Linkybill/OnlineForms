import { SelectionMode } from "@fluentui/react";
import { FieldDescriptionTypes } from "../../../../listItem/types/FieldDescriptionTypes";
import { Filter } from "../../../../dynamicFilter/models/Filter";
import { FieldValueTypes } from "../../../../listItem/types/FieldValueTypes";
import { ListItem } from "../../../../listItem/ListItem";

export interface IGenericListProps {
  filteredFieldNames: string[];
  listName: string;
  fieldDescriptions: FieldDescriptionTypes[];
  data: ListItem[] | undefined;
  currentFilter: Filter[];
  errorMessage: string | undefined;
  webId?: string;
  listId: string;
  selectionMode?: SelectionMode;
  columnWidthMappings: { [columnName: string]: number };
  useGuidPropertyAsId?: boolean;
  onValueChanged: (description: FieldDescriptionTypes, value: FieldValueTypes, validationErrors?: string[]) => void;
  onInlineDeleteClicked?: (listItem: ListItem) => void;
  onInlineEditClicked?: (listItem: ListItem) => void;
  onSortAscendingClicked?: (fieldName: string) => void;
  onSortDescendingClicked?: (fieldName: string) => void;
  onFieldFilterClicked?: (fieldName: string) => void;
  onRemoveFilterClicked?: (fieldNames: string[]) => void;
  onRemoveSortingClicked?: (fieldName: string) => void;
  onSelectionChanged?: (selectedItemIds: number[], selectedGuids: string[]) => void;
  onRenderFooter?: () => JSX.Element;
  onRenderEmptyListRow?: () => JSX.Element;
}
