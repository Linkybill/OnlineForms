import { Draggable } from "react-drag-and-drop";
import { useDragDropContext } from "../../../../helper/DragDropContext";
import { IIconProps } from "@fluentui/react";
import log from "loglevel";
import * as React from "react";
import { ComponentConfig } from "../../../componentProxy/models/componentConfig";
export interface IDraggableComponentProps {
  isSection?: boolean;
  isDivider?: boolean;
  iconProps?: IIconProps;
  componentName: string;
  title: string;
  description: string;
  componentConfig: ComponentConfig;
  type: string;
  canBeUsedOnceOnly?: boolean;
  children?: JSX.Element;
}
export const DraggableComponent: React.FC<IDraggableComponentProps> = (props): JSX.Element => {
  const dragDropInfoProvider = useDragDropContext();

  return (
    <Draggable
      data={JSON.stringify(props.componentConfig)}
      type={"component"}
      onDragStart={(ev: any) => {
        log.debug("started dragging", {
          event: ev,
          x: ev.clientX,
          y: ev.clientY,
          target: ev.target
        });
        dragDropInfoProvider.setItemBeingDragged(props, <>{props.children}</>, 0, 0);
      }}
      onDragEnd={() => {
        dragDropInfoProvider.setItemBeingDragged(undefined, undefined, 0, 0);
      }}>
      {props.children}
    </Draggable>
  );
};
