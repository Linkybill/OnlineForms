import { FC } from "react";
import { Droppable } from "react-drag-and-drop";
import { CellCutPasteInfos, useDragDropContext } from "../../../../helper/DragDropContext";
import { useEditorContext } from "../../../../helper/EditorContext";
import * as React from "react";
import { ComponentConfig } from "../../../componentProxy/models/componentConfig";
import { Guid } from "@microsoft/sp-core-library";
import { Icon, IconButton } from "@fluentui/react";
export const DropTarget: FC<{
  addComponent: (componentConfig: ComponentConfig) => void;
  onCellPasted: (cellPasteInfos: CellCutPasteInfos) => void;
  acceptTypes: string[];
  children?: JSX.Element | JSX.Element[];
}> = (props) => {
  const dragDropInfoProvider = useDragDropContext();
  const dropTargetIsActive = dragDropInfoProvider.cellCutPasteInfos !== undefined || (dragDropInfoProvider.itemBeingDragged !== undefined && props.acceptTypes.indexOf(dragDropInfoProvider.itemBeingDragged.type) > -1);
  const editorContext = useEditorContext();

  return (
    <Droppable
      types={props.acceptTypes} // <= allowed drop types
      onDrop={(something: any) => {
        let addComponentCalled = false;
        props.acceptTypes.forEach((type) => {
          if (something[type] !== undefined && addComponentCalled === false) {
            const configToAdd: ComponentConfig = JSON.parse(something[type]);
            //configToAdd.props.key = Guid.newGuid().toString();

            if (configToAdd.uniqueComponentIdentifier !== undefined) {
              editorContext?.addUniqueComponentKey(configToAdd.uniqueComponentIdentifier);
            }
            props.addComponent(configToAdd);
            addComponentCalled = true;
          }
          dragDropInfoProvider.setItemBeingDragged(undefined, undefined, 0, 0);
        });
      }}>
      <div
        style={
          dropTargetIsActive
            ? {
                opacity: "40%",
                backgroundColor: "lightgreen",
                width: "100%",
                height: "100%"
              }
            : {
                width: "100%",
                height: "100%"
              }
        }>
        {dropTargetIsActive === true && (
          <>
            <IconButton
              iconProps={{ iconName: "Paste" }}
              onClick={() => {
                const infos = dragDropInfoProvider.cellCutPasteInfos;
                if (infos !== undefined) {
                  props.onCellPasted(infos);
                  dragDropInfoProvider.setCuttedCellInfo(undefined);
                  editorContext.setContainerFieldsAreLockedCondition(infos.cuttedCell.uniqueIdentifier, infos.fieldsAreLockedWhenCondition);
                  editorContext.setContainerHiddenWhenCondition(infos.cuttedCell.uniqueIdentifier, infos.hiddenWhenCondition);
                }
              }}></IconButton>
          </>
        )}
        &nbsp;
        {props.children}
      </div>
    </Droppable>
  );
};
