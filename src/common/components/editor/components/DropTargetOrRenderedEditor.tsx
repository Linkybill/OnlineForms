import { Icon, IconButton } from "@fluentui/react";
import log from "loglevel";
import { AcceptComponent } from "../models/DragDropAcceptType";
import { EditorModel } from "../models/EditorModel";
import { DropTarget } from "./dragDrop/DropTarget";
import * as React from "react";
import { ComponentProxy } from "../../componentProxy/ComponentProxy";
import { ComponentConfig } from "../../componentProxy/models/componentConfig";

export const DropTargetOrRenderedEditor = (props: { editorModel: EditorModel; onComponentAddedOrUpdated: (changedComponent: ComponentConfig) => void; onComponentDeleted: () => void }): JSX.Element => {
  log.debug("rendering dropTargetOrRenderedEditor with ", props);
  return props.editorModel.componentConfig === null ? (
    <div style={{ clear: "both" }}>
      <DropTarget
        onCellPasted={undefined}
        acceptTypes={[AcceptComponent]}
        addComponent={(newComponent) => {
          props.onComponentAddedOrUpdated(newComponent);
        }}>
        <Icon iconName="Add" style={{ color: "#179834" }}></Icon>
      </DropTarget>
    </div>
  ) : (
    <>
      <div style={{ clear: "both" }}>
        <IconButton
          iconProps={{ iconName: "Delete" }}
          onClick={() => {
            props.onComponentDeleted();
          }}></IconButton>
      </div>
      <div>
        <ComponentProxy
          componentConfig={props.editorModel.componentConfig}
          onComponentUpdated={(newConfig) => {
            props.onComponentAddedOrUpdated(newConfig);
          }}></ComponentProxy>
      </div>
    </>
  );
};
