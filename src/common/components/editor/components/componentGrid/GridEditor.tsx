import log from "loglevel";
import { Grid } from "../../../grid/grid";
import { IComponentGridProps } from "../../../grid/models/componentGridProps";
import { GridCell } from "../../../grid/models/gridCell";
import { GridRow } from "../../../grid/models/gridRow";
import { DropTarget } from "../dragDrop/DropTarget";
import { CellEditor } from "./CellEditor";
import { AcceptComponent } from "../../models/DragDropAcceptType";
import { useEditorContext } from "../../../../helper/EditorContext";
import * as React from "react";
import { ComponentConfig } from "../../../componentProxy/models/componentConfig";
import { componentNames } from "../../../componentProxy/models/componentNames";
import { ComponentGridCell } from "../../../grid/models/componentGridCell";
import { Guid } from "@microsoft/sp-core-library";
import { CellCutPasteInfos } from "../../../../helper/DragDropContext";

export const GridEditor = (props: IComponentGridProps): JSX.Element => {
  const editorContext = useEditorContext();

  const onComponentUpdated: (componentConfig: ComponentConfig) => void =
    props.onComponentUpdated !== undefined
      ? props.onComponentUpdated
      : () => {
          log.debug("props.oncomponentupdated is undefined in GridEditor");
        };
  const gridRows = props.gridConfig.rows.map((myRow, rowIndex): GridRow[] => {
    const rowsToReturn: GridRow[] = [];
    if (rowIndex === 0) {
      rowsToReturn.push({
        cells: [
          {
            uniqueKey: "gridEditorCell_" + rowIndex + "_cell" + 0,
            widths: { smWidth: 12 },
            content: (
              <>
                <DropTarget
                  onCellPasted={(cellPasteInfos: CellCutPasteInfos) => {
                    props.gridConfig.rows.splice(rowIndex, 0, {
                      cells: [cellPasteInfos.cuttedCell]
                    });
                    const newComponent: ComponentConfig = {
                      name: componentNames.componentGrid,
                      props: props
                    };
                    log.debug("calling onCompoentUpdated, grid, key, ", newComponent, newComponent.props.uniqueKey);
                    onComponentUpdated(newComponent);
                  }}
                  addComponent={(componentConfig) => {
                    props.gridConfig.rows.splice(rowIndex, 0, {
                      cells: [
                        {
                          isEditorContainerWithBackground: componentConfig.isEditorSection,
                          isDivider: componentConfig.isDivider,
                          uniqueIdentifier: Guid.newGuid().toString(),

                          widths: {
                            smWidth: editorContext?.getLastUsedCellWidth()
                          },
                          componentConfig: { ...componentConfig }
                        }
                      ]
                    });
                    const newComponent: ComponentConfig = {
                      name: componentNames.componentGrid,
                      props: props
                    };
                    log.debug("calling onCompoentUpdated, grid, key, ", newComponent, newComponent.props.uniqueKey);
                    onComponentUpdated(newComponent);
                  }}
                  acceptTypes={["component"]}></DropTarget>
              </>
            )
          }
        ]
      });
    }
    const cells: GridCell[] = myRow.cells.map((myCell, cellIndex): GridCell => {
      const cellEditorToRender = (
        <>
          <CellEditor
            componentGridCell={myCell}
            onComponentCellChanged={(changedCell: ComponentGridCell) => {
              log.debug("editor cell changed, newProps: ", changedCell);
              props.gridConfig.rows[rowIndex].cells[cellIndex] = { ...changedCell };

              //setReloadForce((oldVal) => oldVal + 1);
              const newComponent: ComponentConfig = {
                name: componentNames.componentGrid,
                props: props
              };
              onComponentUpdated(newComponent);
            }}
            onCellDeleteClicked={(): void => {
              const cell = props.gridConfig.rows[rowIndex].cells[cellIndex];
              editorContext?.removeUniqueComponentKeysWhichArePartOfConig(cell.componentConfig);
              editorContext.setContainerHiddenWhenCondition(cell.uniqueIdentifier, undefined);
              editorContext.setContainerFieldsAreLockedCondition(cell.uniqueIdentifier, undefined);
              if (props.gridConfig.rows[rowIndex].cells.length > 1) {
                props.gridConfig.rows[rowIndex].cells.splice(cellIndex, 1);
              } else {
                props.gridConfig.rows.splice(rowIndex, 1);
              }
              //setReloadForce((oldValue) => oldValue + 1);
              const newComponent: ComponentConfig = {
                name: componentNames.componentGrid,
                props: props
              };
              log.debug("editor: deleted a cell, going to call on component updated with ", newComponent);
              onComponentUpdated(newComponent);
            }}
            onComponentToTheLeftAdded={(componentConfig) => {
              props.gridConfig.rows[rowIndex].cells.splice(cellIndex, 0, {
                uniqueIdentifier: Guid.newGuid().toString(),
                isEditorContainerWithBackground: componentConfig.isEditorSection,
                isDivider: componentConfig.isDivider,
                widths: {
                  smWidth: editorContext?.getLastUsedCellWidth()
                },
                componentConfig: componentConfig
              });
              //setReloadForce((oldVal) => oldVal + 1);
              const newComponent: ComponentConfig = {
                name: componentNames.componentGrid,
                props: props
              };
              onComponentUpdated(newComponent);
            }}
            onComponentToTheRightAdded={
              cellIndex === myRow.cells.length - 1
                ? (componentConfig) => {
                    props.gridConfig.rows[rowIndex].cells.splice(cellIndex + 1, 0, {
                      uniqueIdentifier: Guid.newGuid().toString(),
                      isEditorContainerWithBackground: componentConfig.isEditorSection,
                      isDivider: componentConfig.isDivider,
                      widths: {
                        smWidth: editorContext?.getLastUsedCellWidth()
                      },
                      componentConfig: componentConfig
                    });
                    //setReloadForce((oldVal) => oldVal + 1);
                    const newComponent: ComponentConfig = {
                      name: componentNames.componentGrid,
                      props: props
                    };
                    onComponentUpdated(newComponent);
                  }
                : undefined
            }
            onCellToTheLeftPasted={(cellInfos) => {
              props.gridConfig.rows[rowIndex].cells.splice(cellIndex, 0, cellInfos.cuttedCell);
              //setReloadForce((oldVal) => oldVal + 1);
              const newComponent: ComponentConfig = {
                name: componentNames.componentGrid,
                props: props
              };
              onComponentUpdated(newComponent);
            }}
            onCellToTheRightPasted={
              cellIndex === myRow.cells.length - 1
                ? (cellInfos) => {
                    props.gridConfig.rows[rowIndex].cells.splice(cellIndex + 1, 0, cellInfos.cuttedCell);
                    //setReloadForce((oldVal) => oldVal + 1);
                    const newComponent: ComponentConfig = {
                      name: componentNames.componentGrid,
                      props: props
                    };
                    onComponentUpdated(newComponent);
                  }
                : undefined
            }></CellEditor>
        </>
      );

      return {
        uniqueKey: "gridEditor_row_" + rowIndex + "_cell_" + (cellIndex + 1),
        content: cellEditorToRender,
        widths: myCell.widths
      };
    });

    rowsToReturn.push({
      cells: cells
    });

    rowsToReturn.push({
      cells: [
        {
          uniqueKey: "editorDropTargetRowForRow_" + rowIndex + "_cell_0",
          widths: { smWidth: 12 },
          content: (
            <>
              <DropTarget
                onCellPasted={(infos): void => {
                  props.gridConfig.rows.splice(rowIndex + 1, 0, {
                    cells: [infos.cuttedCell]
                  });
                  const newComponent: ComponentConfig = {
                    name: componentNames.componentGrid,
                    props: props
                  };
                  onComponentUpdated(newComponent);
                }}
                addComponent={(componentConfig) => {
                  props.gridConfig.rows.splice(rowIndex + 1, 0, {
                    cells: [
                      {
                        uniqueIdentifier: Guid.newGuid().toString(),
                        isEditorContainerWithBackground: componentConfig.isEditorSection,
                        isDivider: componentConfig.isDivider,
                        widths: {
                          smWidth: editorContext?.getLastUsedCellWidth()
                        },
                        componentConfig: componentConfig
                      }
                    ]
                  });
                  //setReloadForce((oldVal) => oldVal + 1);
                  const newComponent: ComponentConfig = {
                    name: componentNames.componentGrid,
                    props: props
                  };
                  onComponentUpdated(newComponent);
                }}
                acceptTypes={[AcceptComponent]}></DropTarget>
            </>
          )
        }
      ]
    });
    return rowsToReturn;
  });

  const rowsToRender: GridRow[] = [];
  gridRows.forEach((rows) => {
    rows.forEach((row) => {
      rowsToRender.push(row);
    });
  });

  if (rowsToRender.length === 0) {
    log.debug("no rows are configured, therefore adding a add");
    rowsToRender.push({
      cells: [
        {
          uniqueKey: "DropTargetIfNoRowsAreAvailable",
          widths: {
            smWidth: 12
          },
          content: (
            <div>
              <DropTarget
                acceptTypes={[AcceptComponent]}
                onCellPasted={(pasteInfo) => {
                  props.gridConfig.rows.push({
                    cells: [pasteInfo.cuttedCell]
                  });
                  //setReloadForce((oldVal) => oldVal + 1);
                  const newComponent: ComponentConfig = {
                    name: componentNames.componentGrid,
                    props: props
                  };
                  onComponentUpdated(newComponent);
                }}
                addComponent={(componentConfig) => {
                  log.debug("dropped a component", componentConfig);
                  props.gridConfig.rows.push({
                    cells: [
                      {
                        isEditorContainerWithBackground: componentConfig.isEditorSection,
                        isDivider: componentConfig.isDivider,

                        uniqueIdentifier: Guid.newGuid().toString(),
                        widths: {
                          smWidth: editorContext?.getLastUsedCellWidth()
                        },
                        componentConfig: componentConfig
                      }
                    ]
                  });
                  //setReloadForce((oldVal) => oldVal + 1);
                  const newComponent: ComponentConfig = {
                    name: componentNames.componentGrid,
                    props: props
                  };
                  onComponentUpdated(newComponent);
                }}></DropTarget>
            </div>
          )
        }
      ]
    });
  }

  return (
    <div>
      <Grid gridConfig={{ rows: rowsToRender }}></Grid>
    </div>
  );
};
