import { ActionButton, ColumnActionsMode, IColumn } from "@fluentui/react";
import { IGenericListManager } from "../interfaces/IGenericListManager";
import log from "loglevel";
import { FieldDescriptionTypes } from "../../../listItem/types/FieldDescriptionTypes";
import React from "react";
export class GenericListManager implements IGenericListManager {
  public createColumns(
    listId: string,
    fields: FieldDescriptionTypes[],
    onColumnClick: (ev: any, column: IColumn) => void,
    ascendingSortedFieldNames: string[],
    descendingSortedFieldNames: string[],
    filteredFieldNames: string[],
    columnWidths: { [fieldName: string]: number },
    onInlineDeleteClicked?: (listItem: ListItem) => void,
    onInlineEditClicked?: (listItem: ListItem) => void
  ): IColumn[] {
    const createdFields = fields.map((field): IColumn => {
      log.debug("evaluation for ", field, {
        containedInAscendingFields: ascendingSortedFieldNames.indexOf(field.internalName) > -1,
        containedInDescendingFields: descendingSortedFieldNames.indexOf(field.internalName) > -1
      });
      return {
        styles: {},
        name: field.displayName,
        fieldName: field.internalName,
        key: "field_" + field.internalName,
        minWidth: columnWidths[field.displayName] // yes...it must be displayName!
          ? columnWidths[field.displayName]
          : 150,
        maxWidth: columnWidths[field.displayName] // yes...it must be displayName!
          ? undefined
          : 200,

        isResizable: true,
        onRenderDivider: (props, defaultRender): JSX.Element | null => {
          if (props !== undefined && props !== null && defaultRender) {
            props.column.minWidth = 50;
            return defaultRender(props);
          }
          return null;
        },

        columnActionsMode: ColumnActionsMode.hasDropdown,
        onColumnClick: onColumnClick,
        isSorted: ascendingSortedFieldNames.indexOf(field.internalName) > -1 || descendingSortedFieldNames.indexOf(field.internalName) > -1,
        isSortedDescending: descendingSortedFieldNames.indexOf(field.internalName) > -1,
        isFiltered: filteredFieldNames.indexOf(field.internalName) > -1,
        data: field
      };
    });

    if (onInlineEditClicked !== undefined || onInlineEditClicked !== undefined) {
      createdFields.push({
        key: "inlineEdit",
        fieldName: "inlineEdit",
        minWidth: 100,
        maxWidth: 100,
        name: "",
        data: "",
        onRenderField: (props, originalRender): JSX.Element => {
          props.item["inlineEdit"] = (
            <div
              style={{
                width: "100%",
                textAlign: "right"
              }}>
              <>
                {onInlineEditClicked !== undefined && (
                  <>
                    <ActionButton
                      className="iconButton"
                      iconProps={{ iconName: "Edit" }}
                      onClick={() => {
                        onInlineEditClicked(props.item);
                      }}
                    />
                  </>
                )}
                {onInlineDeleteClicked !== undefined && (
                  <>
                    <ActionButton
                      className="iconButton"
                      iconProps={{ iconName: "Delete" }}
                      onClick={() => {
                        onInlineDeleteClicked(props.item);
                      }}
                    />
                  </>
                )}
              </>
            </div>
          );
          return originalRender(props);
        }
      });
    }

    log.debug("creating columns " + listId, {
      fields,
      ascendingSortedFieldNames,
      descendingSortedFieldNames,
      createdFields: createdFields
    });
    return createdFields;
  }
}
