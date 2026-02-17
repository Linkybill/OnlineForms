import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ActionButton, DetailsList, DetailsListLayoutMode, IColumn, IContextualMenuItem, IconButton, SelectionMode } from "@fluentui/react";
import log from "loglevel";
import { ActionTrigger } from "../models/ActionTrigger";
import { ModalWithCloseButton } from "../../components/modals/ModalWithCloseButton";
import { TriggerType, TriggerTypes } from "../models/ActionTriggerTypes";
import { ActionTriggerEditor } from "./ActionTriggerEditor";
import { createEmptyActionTrigger } from "../helper/ActionTriggerHelper";

import { DetailsRowPropsContextProvider } from "../../helper/DetailsRowPropsContext";
import { useActionTriggerDragDropContext } from "./ActionTriggerDragDropContext";
import { ActionTriggerListItem } from "../models/ActionTriggerListItem";

export const ActionTriggerList = (props: {
  parentContainerId: string;
  saveImmediatly: boolean;
  filterListOnFieldName?: string;
  actionTrigger: ActionTrigger[];
  onTriggerListChanged: (changedTrigger: ActionTrigger[]) => void;
}): JSX.Element => {
  const [triggerIdWhichGetsEdited, setTriggerIdWhichGetsEdited] = useState<string | undefined>(undefined);
  const [triggerTypeBeingCreated, setTriggerTypeBeingCreated] = useState<TriggerType | undefined>(undefined);

  const [expandedContainerIds, setExpandedContainerIds] = useState<string[]>([]);
  const actrionTriggerDragDropContext = useActionTriggerDragDropContext();
  const [addTriggerFormTitle, setAddTriggerFormTitle] = useState<string>("");

  const getFormNamesForEditingForm = (type: TriggerTypes): string => {
    switch (type) {
      case TriggerTypes.ContainerTriggerType:
        return "Sammelregel bearbeiten";
      case TriggerTypes.DatasourceTriggerType:
        return "Datenquelle laden Aktion bearbeiten";
      case TriggerTypes.SaveFormTriggerType:
        return "Formular speichern Aktion bearbeiten";
      case TriggerTypes.SetFieldValueTriggerType:
        return "Feldwert setzen Aktion bearbeiten";
      case TriggerTypes.SharePointCreateListItemsTriggerType:
        return "SharePoint Listenelemente anlegen Aktion bearbeiten";
      case TriggerTypes.SetRepeatedListFieldTriggerType:
        return "Wiederholtes Element setzen Aktion bearbeiten";
      default:
        return "Aktion bearbeiten";
    }
  };

  const openCreateTrigger = (type: TriggerType, title: string) => {
    setTriggerTypeBeingCreated(type);
    setAddTriggerFormTitle(title);
  };

  const mapActionTriggerToListItem = (actionTrigger: ActionTrigger): ActionTriggerListItem => {
    const isExpanded = expandedContainerIds.indexOf(actionTrigger.uniqueIdentifier) > -1;

    return {
      expandCollapse:
        actionTrigger.type === TriggerTypes.ContainerTriggerType ? (
          <IconButton
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setExpandedContainerIds((old) => {
                const expanded = old.indexOf(actionTrigger.uniqueIdentifier) > -1;
                return expanded ? old.filter((id) => id !== actionTrigger.uniqueIdentifier) : [...old, actionTrigger.uniqueIdentifier];
              });
            }}
            iconProps={{
              iconName: isExpanded === true ? "ChevronDownSmall" : "ChevronRightSmall"
            }}
          />
        ) : (
          <></>
        ),
      triggeredByFieldName: actionTrigger.fieldNameWhichTriggersAction,
      type: actionTrigger.type,
      title: actionTrigger.title,
      description: actionTrigger.description,
      id: actionTrigger.uniqueIdentifier,
      key: actionTrigger.uniqueIdentifier,
      data: actionTrigger,
      isDummyForDropTarget: false,
      dataForDropEvents: { containerIdWhereItemNeedsToBeInerted: "" }
    };
  };

  const createDummyListItemForDropTargetOnEmptyLists = (containerIdWhereItemNeedsToBeInserted: string): ActionTriggerListItem => {
    const trigger = createEmptyActionTrigger(TriggerTypes.SetFieldValueTriggerType, "Item hier hinzufügen", 0);
    trigger.title = "Zum Hinzufügen hierher ziehen";
    trigger.description = "Zum Hinzufügen hierher ziehen";
    const listItem = mapActionTriggerToListItem(trigger);
    listItem.isDummyForDropTarget = true;
    listItem.dataForDropEvents.containerIdWhereItemNeedsToBeInerted = containerIdWhereItemNeedsToBeInserted;
    return listItem;
  };

  useEffect(() => {
    setExpandedContainerIds((old) => old.filter((oldId) => oldId !== actrionTriggerDragDropContext.itemIdBeingDragged));
  }, [actrionTriggerDragDropContext.itemIdBeingDragged]);

  // ✅ stabile Handler, damit Delete/Edit nie mit "alten props" arbeiten
  const onEditTrigger = useCallback((id: string) => {
    setTriggerIdWhichGetsEdited(id);
  }, []);

  const onDeleteTrigger = useCallback(
    (id: string) => {
      const newTriggers = props.actionTrigger.filter((t) => t.uniqueIdentifier !== id);
      props.onTriggerListChanged(newTriggers);
    },
    [props.actionTrigger, props.onTriggerListChanged]
  );

  const memorisedItems = useMemo<ActionTriggerListItem[]>(() => {
    const mappedItems = props.actionTrigger.map((a) => mapActionTriggerToListItem(a));
    log.debug("ActionTriggerList, mapped actions to ActionListItems:", mappedItems);

    // ✅ wenn kein Filter gesetzt ist: nicht filtern
    const f = props.filterListOnFieldName;
    if (f === undefined || f === null || f === "") {
      return mappedItems;
    }

    return mappedItems.filter((i) => i.data.fieldNameWhichTriggersAction === f);
  }, [props.actionTrigger, expandedContainerIds, props.filterListOnFieldName]);

  const addMenuItems: IContextualMenuItem[] = [
    { key: "Container", text: "Sammelregel anlegen", onClick: () => openCreateTrigger(TriggerTypes.ContainerTriggerType, "Neue Sammelregel anlegen") },
    { key: "addDatasourceTrigger", text: "Datenquelle ausführen", onClick: () => openCreateTrigger(TriggerTypes.DatasourceTriggerType, "Neue Datenquelle ausführen Aktion") },
    { key: "addSharePointCreateItemsTrigger", text: "SharePoint Listenelemente anlegen", onClick: () => openCreateTrigger(TriggerTypes.SharePointCreateListItemsTriggerType, "Neue SharePoint Listenelemente anlegen Aktion") },
    { key: "addSetRepeatedListFieldTrigger", text: "Wiederholtes Element setzen", onClick: () => openCreateTrigger(TriggerTypes.SetRepeatedListFieldTriggerType, "Neue Aktion: Wiederholtes Element setzen") },
    { key: "addSetFieldTrigger", text: "Wert setzen", onClick: () => openCreateTrigger(TriggerTypes.SetFieldValueTriggerType, "Neue Wert setzen Aktion") },
    { key: "saveFormTrigger", text: "Formular speichern", onClick: () => openCreateTrigger(TriggerTypes.SaveFormTriggerType, "Neue Formular speichern Aktion") },
    {
      key: "DocSetVersionAndTriggerWorkflow",
      text: "Workflow triggern und neue Version erstellen Aktion",
      onClick: () => openCreateTrigger(TriggerTypes.CreateVersionTriggerType, "Workflow triggern und neue Version erstellen Aktion")
    }
  ];

  const listColumns: IColumn[] = useMemo(() => {
    const cols: IColumn[] = [
      { key: "expandCollapse", minWidth: 10, maxWidth: 20, name: "", fieldName: "expandCollapse", isResizable: false },
      { key: "title", minWidth: 50, name: "title", fieldName: "title", isResizable: true },
      {
        key: "rowActions",
        name: "",
        minWidth: 70,
        maxWidth: 70,
        isResizable: false,
        onRender: (item?: ActionTriggerListItem) => {
          if (!item || item.isDummyForDropTarget) return null;

          const stop = (e: any) => e.stopPropagation();

          return (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton
                iconProps={{ iconName: "Edit" }}
                title="Bearbeiten"
                ariaLabel="Bearbeiten"
                onMouseDown={stop}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTrigger(item.id);
                }}
              />

              <IconButton
                iconProps={{ iconName: "Delete" }}
                title="Löschen"
                ariaLabel="Löschen"
                onMouseDown={stop}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTrigger(item.id);
                }}
              />
            </div>
          );
        }
      }
    ];
    return cols;
  }, [onDeleteTrigger, onEditTrigger]);

  const editedTrigger = triggerIdWhichGetsEdited !== undefined ? props.actionTrigger.find((t) => t.uniqueIdentifier === triggerIdWhichGetsEdited) : undefined;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
        <ActionButton iconProps={{ iconName: "Add" }} text="Hinzufügen" title="Hinzufügen" ariaLabel="Hinzufügen" menuProps={{ items: addMenuItems }} />
      </div>

      <div>
        <DetailsList
          styles={{ root: { overflow: "unset" } }}
          dragDropEvents={actrionTriggerDragDropContext.dragDropEvents}
          selectionMode={SelectionMode.none}
          className="actionTriggerList"
          columns={listColumns}
          items={memorisedItems.length === 0 && actrionTriggerDragDropContext.itemIdBeingDragged !== undefined ? [createDummyListItemForDropTargetOnEmptyLists(props.parentContainerId)] : memorisedItems}
          layoutMode={DetailsListLayoutMode.justified}
          onRenderRow={(rowProps, DefaultRender): JSX.Element => {
            const item = rowProps.item as ActionTriggerListItem;

            const isExpanded = expandedContainerIds.indexOf(item.data.uniqueIdentifier) > -1;
            const isContainerconfig = item.data.type === TriggerTypes.ContainerTriggerType;

            if (isContainerconfig !== true) {
              return <DefaultRender {...rowProps} />;
            }

            return (
              // ✅ falls Context wirklich Expanded-State braucht
              <DetailsRowPropsContextProvider isExpanded={isExpanded} rowProps={rowProps}>
                <>
                  {isExpanded !== true ? (
                    <DefaultRender {...rowProps} />
                  ) : (
                    <div style={{ borderStyle: "solid", borderColor: "gray", borderWidth: 1, width: "90%" }}>
                      <DefaultRender {...rowProps} />
                      <div style={{ paddingLeft: 35 }}>
                        <ActionTriggerEditor
                          onCancel={() => {}}
                          showSaveButton={false}
                          showConfigEditor={true}
                          showMetadataInEditor={false}
                          saveImmediatly={true}
                          onTriggerSaved={(trigger: ActionTrigger) => {
                            const newList = [...props.actionTrigger];
                            const index = newList.findIndex((t) => t.uniqueIdentifier === item.data.uniqueIdentifier);
                            newList[index] = trigger;
                            props.onTriggerListChanged(newList);
                          }}
                          trigger={item.data}
                        />
                      </div>
                    </div>
                  )}
                </>
              </DetailsRowPropsContextProvider>
            );
          }}
        />
      </div>

      <>
        {triggerTypeBeingCreated !== undefined && (
          <ModalWithCloseButton styles={{ main: { width: "80%" } }} onClose={() => setTriggerTypeBeingCreated(undefined)} isOpen={true} title={addTriggerFormTitle}>
            <ActionTriggerEditor
              onCancel={() => setTriggerTypeBeingCreated(undefined)}
              showSaveButton={true}
              showConfigEditor={true}
              showMetadataInEditor={true}
              saveImmediatly={props.saveImmediatly}
              onTriggerSaved={(trigger: ActionTrigger) => {
                const newList = [...props.actionTrigger];
                newList.push(trigger);
                setTriggerTypeBeingCreated(undefined);
                setTriggerIdWhichGetsEdited(trigger.uniqueIdentifier);
                props.onTriggerListChanged(newList);
              }}
              trigger={createEmptyActionTrigger(triggerTypeBeingCreated, props.filterListOnFieldName, props.actionTrigger.length)}
            />
          </ModalWithCloseButton>
        )}

        {triggerIdWhichGetsEdited !== undefined && editedTrigger !== undefined && (
          <ModalWithCloseButton styles={{ main: { width: "80%" } }} onClose={() => setTriggerIdWhichGetsEdited(undefined)} isOpen={true} title={getFormNamesForEditingForm(editedTrigger.type)}>
            <ActionTriggerEditor
              onCancel={() => setTriggerIdWhichGetsEdited(undefined)}
              showSaveButton={true}
              showConfigEditor={true}
              showMetadataInEditor={true}
              saveImmediatly={props.saveImmediatly}
              onTriggerSaved={(trigger: ActionTrigger) => {
                const newList = [...props.actionTrigger];
                const index = newList.findIndex((t) => t.uniqueIdentifier === triggerIdWhichGetsEdited);
                if (index >= 0) {
                  newList[index] = trigger;
                  props.onTriggerListChanged(newList);
                }
              }}
              trigger={editedTrigger}
            />
          </ModalWithCloseButton>
        )}
      </>
    </>
  );
};
