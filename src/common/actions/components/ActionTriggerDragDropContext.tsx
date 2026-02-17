import { IDragDropEvents } from "@fluentui/react";
import React, { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { ActionTrigger } from "../models/ActionTrigger";
import log from "loglevel";
import { TriggerTypes } from "../models/ActionTriggerTypes";
import { ContainerTriggerConfig } from "../models/ContainerTrigger/ContainerTriggerConfig";
import { Container } from "react-dom";
import { ActionTriggerListItem } from "../models/ActionTriggerListItem";

interface ActionTriggerDragDropManager {
  dragDropEvents: IDragDropEvents | undefined;
  itemIdBeingDragged: string | undefined;
  onDropedIntoEmptyList: (identifierWhereItemGotDroppedInto: string) => void;
}

const ActionTriggerDragDropContext = React.createContext<ActionTriggerDragDropManager>({
  dragDropEvents: undefined,
  onDropedIntoEmptyList: () => {},
  itemIdBeingDragged: undefined
});

export const useActionTriggerDragDropContext = () => useContext(ActionTriggerDragDropContext);

const findTrigger = (identifierToSearch: string, currentTriggerContainerBeingSearched: ActionTrigger[]): ActionTrigger | undefined => {
  let triggerToReturn: ActionTrigger | undefined = undefined;
  for (let i = 0; i < currentTriggerContainerBeingSearched.length; i++) {
    const t = currentTriggerContainerBeingSearched[i];
    if (t.uniqueIdentifier === identifierToSearch) {
      triggerToReturn = t;
      break;
    }
    if (t.type == TriggerTypes.ContainerTriggerType) {
      const triggerListToSearchIn = (t.config as ContainerTriggerConfig).childActions;
      const result = findTrigger(identifierToSearch, triggerListToSearchIn);
      if (result !== undefined) {
        triggerToReturn = result;
        break;
      }
    }
  }
  return triggerToReturn;
};

export const findIndexRecursivly = (idToSearch: string, currentTriggerContainerBeingSearched: ActionTrigger[]): number => {
  let indexToReturn: number = -1;
  for (let i = 0; i < currentTriggerContainerBeingSearched.length; i++) {
    const t = currentTriggerContainerBeingSearched[i];
    if (t.uniqueIdentifier === idToSearch) {
      indexToReturn = i;
      break;
    }
    if (t.type == TriggerTypes.ContainerTriggerType) {
      const triggerListToSearchIn = (t.config as ContainerTriggerConfig).childActions;
      const result = findIndexRecursivly(idToSearch, triggerListToSearchIn);
      if (result !== -1) {
        indexToReturn = result;
        break;
      }
    }
  }
  return indexToReturn;
};

const findEffectedTriggerList = (identifierToSearch: string, currentTriggerContainerBeingSearched: ActionTrigger[]): ActionTrigger[] | undefined => {
  let triggerToReturn: ActionTrigger[] | undefined = undefined;
  for (let i = 0; i < currentTriggerContainerBeingSearched.length; i++) {
    const t = currentTriggerContainerBeingSearched[i];
    if (t.uniqueIdentifier === identifierToSearch) {
      triggerToReturn = currentTriggerContainerBeingSearched;
      break;
    }
    if (t.type == TriggerTypes.ContainerTriggerType) {
      const triggerListToSearchIn = (t.config as ContainerTriggerConfig).childActions;
      const result = findEffectedTriggerList(identifierToSearch, triggerListToSearchIn);
      if (result !== undefined) {
        triggerToReturn = result;
        break;
      }
    }
  }
  return triggerToReturn;
};

export const ActrionTriggerDragDropProvider = (props: { children?: JSX.Element | JSX.Element[] | string; actionTrigger: ActionTrigger[]; onTriggerChanged: (changedTrigger: ActionTrigger[]) => void }) => {
  const [itemIdBeingDragged, setItemIdBeingDragged] = useState<string>(undefined);
  const triggerBeingDragged = useRef<ActionTriggerListItem | undefined>(undefined);
  const indexBeingDragged = useRef<number>(0);
  const triggerBeingDroppedTo = useRef<ActionTriggerListItem | undefined>(undefined);

  return (
    <ActionTriggerDragDropContext.Provider
      value={{
        onDropedIntoEmptyList: (identifierWhereItemGotDroppedInto: string) => {
          let listFromWhichItemGotDragged = findEffectedTriggerList(triggerBeingDragged.current.data.uniqueIdentifier, props.actionTrigger);

          const actionTrigger = findTrigger(identifierWhereItemGotDroppedInto, props.actionTrigger);
          if (actionTrigger !== undefined && actionTrigger.type === TriggerTypes.ContainerTriggerType) {
            (actionTrigger.config as ContainerTriggerConfig).childActions.push(triggerBeingDragged.current.data);
            listFromWhichItemGotDragged.splice(indexBeingDragged.current, 1);
            props.onTriggerChanged(props.actionTrigger);
          }
          setItemIdBeingDragged(undefined);
        },
        itemIdBeingDragged: itemIdBeingDragged,
        dragDropEvents: {
          canDrag: () => true,
          canDrop: (item) => {
            const canDrop = itemIdBeingDragged !== (item.data.data as ActionTrigger).uniqueIdentifier;
            return canDrop;
          },
          onDragStart: (item) => {
            const trigger: ActionTriggerListItem = item;
            const itemIndex = findIndexRecursivly(trigger.data.uniqueIdentifier, props.actionTrigger);
            indexBeingDragged.current = itemIndex;
            triggerBeingDragged.current = trigger;
            setItemIdBeingDragged(trigger.data.uniqueIdentifier);
          },
          onDragEnter: (item, ev): string => {
            const trigger: ActionTriggerListItem = item as ActionTriggerListItem;
            triggerBeingDroppedTo.current = trigger;

            return "dragging";
          },
          onDragEnd: () => {
            setItemIdBeingDragged(undefined);
          },
          onDrop: (item, ev) => {
            let listFromWhichItemGotDragged = findEffectedTriggerList(triggerBeingDragged.current.data.uniqueIdentifier, props.actionTrigger);
            const listWhereItemGotDroppedInto = findEffectedTriggerList(triggerBeingDroppedTo.current.data.uniqueIdentifier, props.actionTrigger);

            if (triggerBeingDroppedTo.current.isDummyForDropTarget === true) {
              const listWhereTriggerNeedsToGetPushedTo: ActionTrigger = findTrigger(triggerBeingDroppedTo.current.dataForDropEvents.containerIdWhereItemNeedsToBeInerted, props.actionTrigger);
              if (listWhereTriggerNeedsToGetPushedTo.type === TriggerTypes.ContainerTriggerType) {
                (listWhereTriggerNeedsToGetPushedTo.config as ContainerTriggerConfig).childActions.push(triggerBeingDragged.current.data);
                listFromWhichItemGotDragged.splice(indexBeingDragged.current, 1);
              }
            } else {
              const needToMoveWithinSameList = listFromWhichItemGotDragged.findIndex((t) => t.uniqueIdentifier === triggerBeingDroppedTo.current.data.uniqueIdentifier) > -1;
              const indexBeingDroppedTo = listWhereItemGotDroppedInto.findIndex((t) => t.uniqueIdentifier === triggerBeingDroppedTo.current.data.uniqueIdentifier);
              listFromWhichItemGotDragged.splice(indexBeingDragged.current, 1);
              if (needToMoveWithinSameList) {
                const newIndexToDrop = indexBeingDroppedTo;
                listFromWhichItemGotDragged.splice(newIndexToDrop, 0, triggerBeingDragged.current.data);
              } else {
                listWhereItemGotDroppedInto.splice(indexBeingDroppedTo, 0, triggerBeingDragged.current.data);
              }
            }
            setItemIdBeingDragged(undefined);

            props.onTriggerChanged(props.actionTrigger);
          }
        }
      }}>
      {props.children}
    </ActionTriggerDragDropContext.Provider>
  );
};
