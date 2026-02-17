import * as React from "react";
import { useContext, useState } from "react";
import { IDraggableComponentProps } from "../components/editor/components/dragDrop/DraggableComponent";
import { ComponentGridCell } from "../components/grid/models/componentGridCell";

export interface CellCutPasteInfos {
  cuttedCell: ComponentGridCell;
  hiddenWhenCondition: string;
  fieldsAreLockedWhenCondition: string;
}

export interface DragDropInfoProvider {
  itemBeingDragged: IDraggableComponentProps | undefined;
  contentBeingDragged: JSX.Element | undefined;
  draggedMouseX: number;
  draggedMouseY: number;
  setItemBeingDragged: (component: IDraggableComponentProps | undefined, content: JSX.Element | undefined, mouseX: number, mouseY: number) => void;
  setCuttedCellInfo: (infos: CellCutPasteInfos | undefined) => void;
  cellCutPasteInfos: CellCutPasteInfos | undefined;
}

export const DragDropContext = React.createContext<DragDropInfoProvider>({
  itemBeingDragged: undefined,
  cellCutPasteInfos: undefined,
  setCuttedCellInfo: () => {
    throw new Error("not implemented");
  },
  setItemBeingDragged: () => {
    throw new Error("not implemented");
  },
  contentBeingDragged: undefined,
  draggedMouseX: 0,
  draggedMouseY: 0
});

export const useDragDropContext = () => useContext(DragDropContext);

export const DragDropContextProvider: React.FC<{ children?: JSX.Element | JSX.Element[] | string }> = (props): JSX.Element => {
  const [draggedMouseX, setDraggedMouseX] = useState(0);
  const [draggedMouseY, setDraggedMouseY] = useState(0);
  const [currentItemBeingDragged, setCurrentItemBeingDragged] = React.useState<IDraggableComponentProps | undefined>(undefined);
  const [currentContentBeingDragged, setCurrentContentBeingDragged] = useState<JSX.Element | undefined>(undefined);
  const [currentCutPasteInfos, setCurrentCutPasteInfos] = React.useState<CellCutPasteInfos | undefined>(undefined);
  return (
    <DragDropContext.Provider
      value={{
        cellCutPasteInfos: currentCutPasteInfos,
        setCuttedCellInfo: (infos: CellCutPasteInfos | undefined): void => {
          setCurrentCutPasteInfos(infos);
        },
        contentBeingDragged: currentContentBeingDragged,
        itemBeingDragged: currentItemBeingDragged,
        setItemBeingDragged: (newValue: IDraggableComponentProps | undefined, content: JSX.Element | undefined, draggedMouseX: number, draggedMouseY: number) => {
          setDraggedMouseX(draggedMouseX);
          setDraggedMouseY(draggedMouseY);
          if (newValue === undefined) {
            setCurrentItemBeingDragged(undefined);
            setCurrentContentBeingDragged(undefined);
          } else {
            setCurrentContentBeingDragged(content);
            setCurrentItemBeingDragged((oldVal: any) => {
              return {
                ...newValue
              };
            });
          }
        },
        draggedMouseX: draggedMouseX,
        draggedMouseY: draggedMouseY
      }}>
      {props.children}
    </DragDropContext.Provider>
  );
};
