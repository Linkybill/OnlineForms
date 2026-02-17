import { ColorPicker, IColor, Icon, IconButton, Panel, Slider, TextField } from "@fluentui/react";
import log from "loglevel";
import * as React from "react";
import { useEditorContext } from "../../helper/EditorContext";
import { AcceptComponent } from "../editor/models/DragDropAcceptType";
import { IFieldSetProps } from "./IFieldSetProps";
import { ComponentProxy } from "../componentProxy/ComponentProxy";
import { ComponentConfig } from "../componentProxy/models/componentConfig";
import { componentNames } from "../componentProxy/models/componentNames";
import { DropTarget } from "../editor/components/dragDrop/DropTarget";
import { IComponentGridProps } from "../grid/models/componentGridProps";
import { Guid } from "@microsoft/sp-core-library";

export const FieldSet = (props: IFieldSetProps): JSX.Element => {
  const editorContext = useEditorContext();

  const [editPanelVisible, setEditPanelVisible] = React.useState(false);

  const onComponentUpdated = (updatedChildComponent: ComponentConfig) => {
    if (props.onComponentUpdated !== undefined) {
      const newConfig: ComponentConfig = {
        name: componentNames.fieldSet,
        props: { ...props, componentConfig: { ...updatedChildComponent } }
      };
      props.onComponentUpdated(newConfig);
    }
  };
  return (
    <fieldset
      style={{
        borderWidth: props.lineWidth !== undefined ? props.lineWidth : 1
      }}>
      {editorContext?.isInEditMode && (
        <>
          <IconButton
            iconProps={{ iconName: "Edit" }}
            onClick={() => {
              setEditPanelVisible(true);
            }}></IconButton>
          <IconButton
            iconProps={{ iconName: "Delete" }}
            onClick={() => {
              const newConfig: ComponentConfig = {
                name: componentNames.fieldSet,
                props: {
                  ...props,
                  componentConfig: undefined
                }
              };
              if (props.onComponentUpdated !== undefined) {
                props.onComponentUpdated(newConfig);
              }
            }}></IconButton>
        </>
      )}
      <legend
        style={{
          fontSize: props.headerWidth,
          color: props.headerColor !== undefined && props.headerColor !== "" ? "#" + props.headerColor : undefined
        }}>
        {props.title}
      </legend>

      {props.componentConfig === undefined && (
        <DropTarget
          acceptTypes={[AcceptComponent]}
          addComponent={onComponentUpdated}
          onCellPasted={(infos): void => {
            if (props.onComponentUpdated !== undefined) {
              const newGridConfig: IComponentGridProps = {
                uniqueKey: Guid.newGuid().toString(),
                gridConfig: {
                  rows: [
                    {
                      cells: [infos.cuttedCell]
                    }
                  ]
                }
              };
              const newChildComponent: ComponentConfig = {
                name: componentNames.componentGrid,
                props: newGridConfig
              };
              const newConfig: ComponentConfig = {
                name: componentNames.fieldSet,
                props: { ...props, componentConfig: newChildComponent }
              };
              log.debug("editor fieldset: call componentUpdated with new config", newConfig);
              props.onComponentUpdated(newConfig);
            }
          }}
        />
      )}

      {props.componentConfig !== undefined && <ComponentProxy componentConfig={props.componentConfig} onComponentUpdated={onComponentUpdated}></ComponentProxy>}

      {editPanelVisible && (
        <Panel isOpen={true} onDismiss={() => setEditPanelVisible(false)}>
          <TextField
            label="Gruppentitel"
            value={props.title}
            onChange={(e, newText) => {
              const newConfig: ComponentConfig = {
                name: componentNames.fieldSet,
                props: { ...props, title: newText as string }
              };
              if (props.onComponentUpdated !== undefined) {
                props.onComponentUpdated(newConfig);
              }
            }}></TextField>

          <TextField
            label="Gruppentitel"
            value={props.title}
            onChange={(e, newText) => {
              const newConfig: ComponentConfig = {
                name: componentNames.fieldSet,
                props: { ...props, title: newText as string }
              };
              if (props.onComponentUpdated !== undefined) {
                props.onComponentUpdated(newConfig);
              }
            }}></TextField>
          <ColorPicker
            onChange={(ev, color) => {
              log.debug("fieldSet: color changed: ", color);
              const newConfig: ComponentConfig = {
                name: componentNames.fieldSet,
                props: { ...props, headerColor: color.hex }
              };
              if (props.onComponentUpdated !== undefined) {
                props.onComponentUpdated(newConfig);
              }
            }}
            color={props.headerColor !== undefined ? props.headerColor : ""}
          />
          <Slider
            label="Überschriftendicke"
            min={0}
            max={20}
            ranged={false}
            showValue
            snapToStep
            value={props.headerWidth !== undefined ? props.headerWidth : 1}
            onChange={(newSliderValue) => {
              if (props.onComponentUpdated !== undefined) {
                const newConfig: ComponentConfig = {
                  name: componentNames.fieldSet,
                  props: {
                    ...props,
                    headerWidth: newSliderValue
                  }
                };

                props.onComponentUpdated(newConfig);
              }
            }}></Slider>
          <Slider
            label="Liniendicke"
            min={0}
            max={20}
            ranged={false}
            showValue
            snapToStep
            value={props.lineWidth !== undefined ? props.lineWidth : 1}
            onChange={(newSliderValue) => {
              if (props.onComponentUpdated !== undefined) {
                const newConfig: ComponentConfig = {
                  name: componentNames.fieldSet,
                  props: {
                    ...props,
                    lineWidth: newSliderValue
                  }
                };

                props.onComponentUpdated(newConfig);
              }
            }}></Slider>
        </Panel>
      )}
    </fieldset>
  );
};
