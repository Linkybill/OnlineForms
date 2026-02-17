import * as React from "react";
import { DetailsList, DirectionalHint, IColumn, IContextualMenuProps, Selection, ContextualMenu, SelectionMode, DetailsListLayoutMode, ConstrainMode, IDetailsRowProps, DetailsRow } from "@fluentui/react";

import { IGenericListProps } from "./IGenericListProps";
import { managerFactory } from "../../manager/createManager";
import log from "loglevel";

import { useState } from "react";
import { SelectedFilter } from "./SelectedFilter";
import { useMemo } from "react";
import { FieldProxy } from "../../../../listItem/fields/FieldProxy";
import { ListItem } from "../../../../listItem/ListItem";
import { ListItemContextProvider } from "../../../../helper/ListItemContext";
import { EditorContextProvider } from "../../../../helper/EditorContext";
import { mapListItemToObject } from "../../../../listItem/mapper/ListItemToObjectMapper";

export const GenericList = (props: IGenericListProps): JSX.Element => {
  const [contextualHeaderMenuProps, setContextualHeaderMenuProps] = useState<IContextualMenuProps | undefined>(undefined);

  const alreadyRenderedTrigger = React.useRef(false);
  const [selectedListItemIds, setSelectedListItemIds] = useState<number[]>([]);
  const [selectedGuids, setSelectedGuids] = useState<string[]>([]);
  const selectedListItemIdsRef = React.useRef<number[]>([]);
  const selectedListItemGuidsRef = React.useRef<string[]>([]);

  const [ascendingSortedField, setAscendingSortedField] = useState<string | undefined>();
  const [descendingSortedField, setDescendingSortedField] = useState<string | undefined>();

  log.debug("rendering generic list with ", props);

  const listHasColumnEvents = props.onFieldFilterClicked !== undefined || props.onSortAscendingClicked !== undefined || props.onSortDescendingClicked !== undefined || props.onFieldFilterClicked || undefined;
  const [selection] = useState<Selection>(
    new Selection({
      onSelectionChanged: () => {
        log.debug("slection changed in list view", selection.getSelection());
        const selectedItemIds = selection.getSelection().map((item) => {
          log.debug("mapping item for selection change: ", item);

          return (item as any).ID;
        });

        const selectedGuids = selection.getSelection().map((item) => {
          log.debug("mapping item for selection change: ", item);

          return (item as any).Guid;
        });

        // this is needed, because:
        // when one component filter another, then the items may change. Item Changing results in a selection changed event.
        // But no selection did change in fact, so we need to check, if the selectedItemIds differe from the last selectedItemIds.
        // if so, we do call the onchange.
        // the check needs to be stored into a ref variable (useRef), because this happens during state change and state change to selectedIds does not have any effect
        // here.
        const newlySelectedItemsComparer = selectedItemIds.join(",") + selectedGuids.join(",");
        const currentSelectedItemsComparer = selectedListItemIdsRef.current.join(",") + selectedListItemGuidsRef.current.join(",");
        log.debug("ceck for change in selection", {
          newlySelectedItemsComparer: newlySelectedItemsComparer,
          currentSelectedItemsComparer: currentSelectedItemsComparer
        });

        if (newlySelectedItemsComparer !== currentSelectedItemsComparer) {
          props.onSelectionChanged(selectedItemIds, selectedGuids);

          setSelectedListItemIds(selectedItemIds);
          selectedListItemIdsRef.current = selectedItemIds;
          setSelectedGuids(selectedGuids);
          selectedListItemGuidsRef.current = selectedGuids;
        }
      },
      selectionMode: SelectionMode.multiple
    })
  );

  const renderItemColumn = (item?: ListItem, index?: number, column?: IColumn) => {
    if (!item || !column) return null;

    const field = item.getProperties().find((prop) => prop.description.internalName === column.fieldName);
    log.debug("detailslist onrenderItemCOlumn ", { item: item, index: index, field: field });
    return field ? <FieldProxy key={column.fieldName} onValueChanged={props.onValueChanged} editMode={false} renderAsTextOnly={true} propertyInstance={field} /> : item[column.fieldName];
  };

  const renderRow = (detailsRowProps: IDetailsRowProps) => {
    const item = detailsRowProps.item as ListItem;
    const newItem = new ListItem(item.ID);
    newItem.Guid = item.Guid;
    newItem.ContentTypeId = item.ContentTypeId;
    newItem.addProperties(item.getProperties());
    log.debug("onRenderRow generic list with props ", { props: props, item: item });
    return (
      <EditorContextProvider
        isInEditMode={false}
        editorModel={{
          componentConfig: undefined,
          containerFieldsAreLockedConditions: {},
          containerHiddenWhenConditions: {},
          customFieldDefinitions: [],
          datasources: [],
          fieldTriggers: [],
          saveTriggers: [],
          startupTriggers: [],
          uniqueComponentKeys: [],
          ignoreFieldsInItemJSON: [],
          mirroredSPListFields: []
        }}>
        <ListItemContextProvider
          shouldShowHelpTextsOnFields={false}
          onFormClose={() => {}}
          //listItemHasConflictingChanges={() => false}
          shouldUpdateListItemInUseEffect={true}
          registeredContainerLockedConditions={{}}
          registeredContainerHiddenWhenConditions={{}}
          onListItemSave={(item) => {
            return item;
          }}
          listItem={newItem}>
          <>
            <DetailsRow {...detailsRowProps} onRenderItemColumn={renderItemColumn} />
          </>
        </ListItemContextProvider>
      </EditorContextProvider>
    );
  };

  const memorizedDataToRender = useMemo(() => {
    return props.data;
  }, [JSON.stringify(props.data === undefined ? {} : JSON.stringify(props.data.map((d) => mapListItemToObject(d))))]);

  const onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    const headerProps = getContextualMenuProps(ev, column);
    setContextualHeaderMenuProps(headerProps);
  };

  const shouldRenderDummyRowForEmptyMessage = props.onRenderEmptyListRow !== undefined && (memorizedDataToRender === undefined || memorizedDataToRender.length === 0);

  const genericListManager = managerFactory.createGenericListViewManager();
  alreadyRenderedTrigger.current = true;

  const listColumns: IColumn[] = genericListManager.createColumns(
    props.listId,
    props.fieldDescriptions,
    listHasColumnEvents === true ? onColumnClick : undefined,
    ascendingSortedField ? [ascendingSortedField] : [],
    descendingSortedField ? [descendingSortedField] : [],
    props.filteredFieldNames,
    props.columnWidthMappings,
    props.onInlineDeleteClicked,
    props.onInlineEditClicked
  );

  const getContextualMenuProps = (ev: React.MouseEvent<HTMLElement>, column: IColumn): IContextualMenuProps => {
    const items: any[] = [];
    if (props.onSortAscendingClicked !== undefined) {
      items.push({
        key: "aToZ",
        name: "A to Z",
        iconProps: { iconName: "SortUp" },
        canCheck: true,
        checked: column.isSorted && !column.isSortedDescending,
        onClick: () => {
          setDescendingSortedField(undefined);
          setAscendingSortedField(column.fieldName);
          props.onSortAscendingClicked(column.fieldName ? column.fieldName : "");
        }
      });
    }
    if (props.onSortDescendingClicked !== undefined) {
      items.push({
        key: "zToA",
        name: "Z to A",
        iconProps: { iconName: "SortDown" },
        canCheck: true,
        checked: column.isSorted && column.isSortedDescending,
        onClick: () => {
          setAscendingSortedField(undefined);
          setDescendingSortedField(column.fieldName);
          props.onSortDescendingClicked(column.fieldName ? column.fieldName : "");
        }
      });
    }
    if (props.onFieldFilterClicked !== undefined) {
      items.push({
        key: "filterBy",
        name: "Filtern nach " + column.name,
        iconProps: { iconName: "Filter" },
        canCheck: true,
        checked: column.isFiltered,
        onClick: () => {
          props.onFieldFilterClicked(column.fieldName ? column.fieldName : "");
        }
      });
    }

    if (column.isFiltered) {
      items.push({
        key: "removeFilter",
        name: "Filter entfernen",
        iconProps: { iconName: "ClearFilter" },
        canCheck: true,
        checked: false,
        onClick: () => {
          props.onRemoveFilterClicked(column.fieldName ? [column.fieldName] : [""]);
        }
      });
    }
    if (column.isSorted) {
      items.push({
        key: "removeSorting",
        name: "Sortierung aufheben",
        iconProps: { iconName: "Delete" },
        canCheck: false,
        checked: false,
        onClick: () => {
          props.onRemoveSortingClicked(column.fieldName ? column.fieldName : "");
        }
      });
    }

    return {
      items: items,
      target: ev.currentTarget as HTMLElement,
      directionalHint: DirectionalHint.bottomCenter,
      gapSpace: 10,
      isBeakVisible: true,
      onDismiss: () => {
        setContextualHeaderMenuProps(undefined);
      }
    };
  };

  log.debug("rendering genericList " + props.listName, {
    selectedIds: selectedListItemIds,
    selectedGuids: selectedGuids,
    memorizedDataToRender: memorizedDataToRender,
    selecttionItems: selection.getItems(),
    selection: selection,
    props,
    ascendingSortedField: ascendingSortedField,
    descendingSortedField: descendingSortedField,
    listColumns: listColumns,
    dataWithProxy: props.data // todo: hier das result vom mapper oben reinschmeissen. (dataWithReactComponents)
  });
  return (
    <>
      <SelectedFilter filter={props.currentFilter} onFilterRemove={props.onRemoveFilterClicked} listName={props.listName} />
      <DetailsList
        onRenderItemColumn={renderItemColumn}
        onRenderDetailsFooter={
          props.onRenderFooter !== undefined
            ? () => {
                return props.onRenderFooter();
              }
            : undefined
        }
        items={shouldRenderDummyRowForEmptyMessage ? [{}] : memorizedDataToRender !== undefined ? memorizedDataToRender : []}
        onRenderRow={
          shouldRenderDummyRowForEmptyMessage === true
            ? () => {
                return props.onRenderEmptyListRow();
              }
            : renderRow
        }
        columns={listColumns}
        selection={selection}
        selectionPreservedOnEmptyClick={true}
        selectionMode={props.onSelectionChanged !== undefined ? props.selectionMode : SelectionMode.none}></DetailsList>

      {contextualHeaderMenuProps && <ContextualMenu {...contextualHeaderMenuProps} />}
    </>
  );
};
