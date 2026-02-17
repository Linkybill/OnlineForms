import { Checkbox, Icon, IconButton, Panel, Slider, TextField } from "@fluentui/react";
import { AcceptComponent } from "../../models/DragDropAcceptType";
import { DropTarget } from "../dragDrop/DropTarget";
import * as React from "react";
import { useState } from "react";
import { useEditorContext } from "../../../../helper/EditorContext";
import { ComponentProxy } from "../../../componentProxy/ComponentProxy";
import { ComponentConfig } from "../../../componentProxy/models/componentConfig";
import { Grid } from "../../../grid/grid";
import { GridCell } from "../../../grid/models/gridCell";
import * as log from "loglevel";
import { ModalWithCloseButton } from "../../../modals/ModalWithCloseButton";
import { ComponentGridCell } from "../../../grid/models/componentGridCell";
import { ConditionEditor } from "../conditionEditor/ConditionEditor";
import { Guid } from "@microsoft/sp-core-library";
import { FieldTypeNames } from "../../../../listItem/FieldTypeNames";
import { CellCutPasteInfos, useDragDropContext } from "../../../../helper/DragDropContext";
import { NoteField } from "../../../../listItem/fields/noteField/NoteField";
import { NoteFieldDescription } from "../../../../listItem/fields/noteField/NoteFieldDescription";
import { Accordion } from "../../../register/components/AccordionView/Accordion";
import { componentNames } from "../../../componentProxy/models/componentNames";

export const CellEditor = (props: {
  onComponentToTheLeftAdded: ((addedComponent: ComponentConfig) => void) | undefined;
  onComponentToTheRightAdded: ((addedComponent: ComponentConfig) => void) | undefined;
  onCellToTheRightPasted: (infos: CellCutPasteInfos) => void;
  onCellToTheLeftPasted: (infos: CellCutPasteInfos) => void;
  onCellDeleteClicked: () => void;

  componentGridCell: ComponentGridCell;
  onComponentCellChanged: (changedCell: ComponentGridCell) => void;
}): JSX.Element => {
  const editorContext = useEditorContext();
  const [cellEditPanelVisible, setCellEditPanelVisible] = useState(false);

  const cells: GridCell[] = [];
  const containerLockedCondition = editorContext.getContainerFieldsAreLockedConditions()[props.componentGridCell.uniqueIdentifier];
  const containerHiddenCondition = editorContext.getContainerHiddenWhenConditions()[props.componentGridCell.uniqueIdentifier];
  const dragDropContext = useDragDropContext();

  if (props.onComponentToTheLeftAdded !== undefined) {
    const event = props.onComponentToTheLeftAdded;
    const pasteEvent = props.onCellToTheLeftPasted;
    cells.push({
      widths: { smWidth: 1 },
      uniqueKey: "cellEditorLeftDropTarget",
      content: (
        <DropTarget
          onCellPasted={pasteEvent}
          acceptTypes={[AcceptComponent]}
          addComponent={(compponentConfig: ComponentConfig) => {
            event(compponentConfig);
          }}>
          <Icon iconName="InsertColumnsLeft" style={{ color: "#179834" }}></Icon>
        </DropTarget>
      )
    });
  }

  const description: NoteFieldDescription = {
    description: "",
    internalName: "description",
    defaultValue: "",
    displayName: "Beschreibung",
    required: true,
    type: FieldTypeNames.Note,
    uniqueKey: "description",
    fullHtml: true,
    numberOfLines: 30
  };

  cells.push({
    widths: { smWidth: 9 },
    uniqueKey: props.componentGridCell.uniqueIdentifier,
    isEditorContainerWithBackground: props.componentGridCell.isEditorContainerWithBackground,
    isDivider: props.componentGridCell.isDivider,
    contentIsRightAlligned: props.componentGridCell.contentIsRightAlligned,

    content: (
      <div>
        <IconButton
          iconProps={{ iconName: "Edit" }}
          onClick={() => {
            setCellEditPanelVisible(true);
          }}></IconButton>
        {containerHiddenCondition !== undefined && containerHiddenCondition !== "" && (
          <>
            <IconButton
              iconProps={{ iconName: "Hide" }}
              onClick={() => {
                setCellEditPanelVisible(true);
              }}
            />
          </>
        )}
        {containerLockedCondition !== undefined && containerLockedCondition !== "" && (
          <>
            <IconButton
              iconProps={{ iconName: "Lock" }}
              onClick={() => {
                setCellEditPanelVisible(true);
              }}
            />
          </>
        )}

        <IconButton
          iconProps={{ iconName: "Delete" }}
          onClick={() => {
            log.debug("deleting a cell, calling props.oncellDeleteClick");
            props.onCellDeleteClicked();
          }}></IconButton>
        <IconButton
          iconProps={{ iconName: "Cut" }}
          onClick={() => {
            dragDropContext.setCuttedCellInfo({
              cuttedCell: props.componentGridCell,
              fieldsAreLockedWhenCondition: containerLockedCondition,
              hiddenWhenCondition: containerHiddenCondition
            });
            props.onCellDeleteClicked();
          }}></IconButton>
        <ComponentProxy
          componentConfig={props.componentGridCell.componentConfig}
          onComponentUpdated={(newProps: ComponentConfig) => {
            const newCell: ComponentGridCell = { ...props.componentGridCell };
            newCell.componentConfig = newProps;
            props.onComponentCellChanged(newCell);
          }}></ComponentProxy>
        {cellEditPanelVisible && (
          <ModalWithCloseButton
            title="Gruppierung von Elementen bearbeiten"
            isOpen={true}
            onClose={() => {
              setCellEditPanelVisible(false);
            }}>
            <>
              <Checkbox
                label="Ausrichtung rechts?"
                onChange={(ev, checked) => {
                  props.onComponentCellChanged({ ...props.componentGridCell, contentIsRightAlligned: checked });
                }}
                checked={props.componentGridCell.contentIsRightAlligned === true}
              />
              <Checkbox
                label="Ist ein Container im Editor?"
                onChange={(ev, checked) => {
                  props.onComponentCellChanged({ ...props.componentGridCell, isEditorContainerWithBackground: checked });
                }}
                checked={props.componentGridCell.isEditorContainerWithBackground === true}
              />

              <Checkbox
                label="Ist ein Trennelement im Formular?"
                onChange={(ev, checked) => {
                  props.onComponentCellChanged({ ...props.componentGridCell, isDivider: checked });
                }}
                checked={props.componentGridCell.isDivider === true}
              />
              <Slider
                defaultValue={props.componentGridCell.widths.smWidth ? props.componentGridCell.widths.smWidth : editorContext.getLastUsedCellWidth()}
                label="Breite festlegen (Standardbreite bzw. small)"
                min={1}
                max={12}
                onChange={(newValue) => {
                  editorContext?.setLastUsedCellWidth(newValue);
                  const newCell: ComponentGridCell = { ...props.componentGridCell };
                  newCell.widths = {
                    ...props.componentGridCell.widths,
                    smWidth: newValue
                  };
                  props.onComponentCellChanged(newCell);
                }}></Slider>
              <Accordion
                uniqueKey="responsiveWidths"
                view="accordion"
                registerConfigs={[
                  {
                    isVisible: true,
                    title: "Responsive Breakpoints",
                    componentConfig: {
                      name: componentNames.reactComponent,
                      props: {
                        content: (
                          <>
                            {" "}
                            <Slider
                              defaultValue={props.componentGridCell.widths.mdWidth ? props.componentGridCell.widths.mdWidth : 0}
                              label="Breite festlegen m"
                              min={0}
                              max={12}
                              onChange={(newValue) => {
                                const newCell: ComponentGridCell = { ...props.componentGridCell };
                                newCell.widths = {
                                  ...props.componentGridCell.widths,
                                  mdWidth: newValue === 0 ? undefined : newValue
                                };
                                props.onComponentCellChanged(newCell);
                              }}></Slider>
                            <Slider
                              defaultValue={props.componentGridCell.widths.lgWidth ? props.componentGridCell.widths.lgWidth : 0}
                              label="Breite festlegen l"
                              min={0}
                              max={12}
                              onChange={(newValue) => {
                                const newCell: ComponentGridCell = { ...props.componentGridCell };
                                newCell.widths = {
                                  ...props.componentGridCell.widths,
                                  lgWidth: newValue === 0 ? undefined : newValue
                                };
                                props.onComponentCellChanged(newCell);
                              }}></Slider>
                            <Slider
                              defaultValue={props.componentGridCell.widths.xlWidth ? props.componentGridCell.widths.xlWidth : 0}
                              label="Breite festlegen xl"
                              min={0}
                              max={12}
                              onChange={(newValue) => {
                                const newCell: ComponentGridCell = { ...props.componentGridCell };
                                newCell.widths = {
                                  ...props.componentGridCell.widths,
                                  xlWidth: newValue === 0 ? undefined : newValue
                                };
                                props.onComponentCellChanged(newCell);
                              }}></Slider>
                            <Slider
                              defaultValue={props.componentGridCell.widths.xxlWidth ? props.componentGridCell.widths.xxlWidth : 0}
                              label="Breite festlegen xxxl"
                              min={0}
                              max={12}
                              onChange={(newValue) => {
                                const newCell: ComponentGridCell = { ...props.componentGridCell };
                                newCell.widths = {
                                  ...props.componentGridCell.widths,
                                  xxlWidth: newValue === 0 ? undefined : newValue
                                };
                                props.onComponentCellChanged(newCell);
                              }}></Slider>
                            <Slider
                              defaultValue={props.componentGridCell.widths.xxxlWidth ? props.componentGridCell.widths.xxxlWidth : 0}
                              label="Breite festlegen xxxl"
                              min={0}
                              max={12}
                              onChange={(newValue) => {
                                const newCell: ComponentGridCell = { ...props.componentGridCell };
                                newCell.widths = {
                                  ...props.componentGridCell.widths,
                                  xxxlWidth: newValue === 0 ? undefined : newValue
                                };
                                props.onComponentCellChanged(newCell);
                              }}></Slider>
                          </>
                        ),
                        uniqueKey: ""
                      },

                      uniqueComponentIdentifier: "breakPoints"
                    }
                  }
                ]}
              />

              <NoteField
                validationErrors={[]}
                renderAsTextOnly={false}
                rawData={""}
                onBlur={() => {}}
                onValueChanged={(d, val) => {
                  const newCell: ComponentGridCell = { ...props.componentGridCell };
                  newCell.infoText = val;
                  props.onComponentCellChanged(newCell);
                }}
                fieldValue={props.componentGridCell.infoText ? props.componentGridCell.infoText : ""}
                editMode={true}
                fieldDescription={description}></NoteField>

              <ConditionEditor
                conditionShouldProduceType="boolean"
                label="Nicht sichtbar wenn / Formel"
                condition={containerHiddenCondition}
                onChange={(text: string) => {
                  if (props.componentGridCell.uniqueIdentifier === undefined || props.componentGridCell.uniqueIdentifier === "") {
                    const newCell: ComponentGridCell = { ...props.componentGridCell };
                    newCell.uniqueIdentifier = Guid.newGuid().toString();
                    props.onComponentCellChanged(newCell);
                  }
                  editorContext.setContainerHiddenWhenCondition(props.componentGridCell.uniqueIdentifier, text);
                }}></ConditionEditor>
              <ConditionEditor
                conditionShouldProduceType="boolean"
                label="Felder nicht bearbeitbar wenn / Formel"
                condition={containerLockedCondition}
                onChange={(text: string) => {
                  if (props.componentGridCell.uniqueIdentifier === undefined || props.componentGridCell.uniqueIdentifier === "") {
                    const newCell: ComponentGridCell = { ...props.componentGridCell };
                    newCell.uniqueIdentifier = Guid.newGuid().toString();
                    props.onComponentCellChanged(newCell);
                  }
                  editorContext.setContainerFieldsAreLockedCondition(props.componentGridCell.uniqueIdentifier, text);
                }}></ConditionEditor>
            </>
          </ModalWithCloseButton>
        )}
      </div>
    )
  });

  if (props.onComponentToTheRightAdded !== undefined) {
    const event = props.onComponentToTheRightAdded;
    const pasteEvent = props.onCellToTheRightPasted;
    cells.push({
      widths: { smWidth: 2 },
      uniqueKey: "cellEditorRightDropTarget",
      content: (
        <DropTarget
          onCellPasted={pasteEvent}
          acceptTypes={[AcceptComponent]}
          addComponent={(compponentConfig: ComponentConfig) => {
            event(compponentConfig);
          }}>
          <Icon iconName="InsertColumnsRight" style={{ color: "#179834" }}></Icon>
        </DropTarget>
      )
    });
  }

  return (
    <Grid
      gridClassname={props.componentGridCell.isEditorContainerWithBackground ? "section" : ""}
      gridConfig={{
        rowStyles: {
          borderStyle: "dotted",
          borderWidth: 1,
          borderColor: "gray"
        },
        rows: [
          {
            cells: cells
          }
        ]
      }}></Grid>
  );
};
