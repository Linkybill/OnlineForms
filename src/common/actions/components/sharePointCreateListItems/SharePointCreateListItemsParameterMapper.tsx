import React, { useEffect, useRef, useState } from "react";
import log from "loglevel";
import { ActionButton } from "@fluentui/react";
import { ParameterMapping } from "../../models/datasources/ParameterMapping";
import { Grid } from "../../../components/grid/grid";
import { GridRow } from "../../../components/grid/models/gridRow";
import { ModalWithCloseButton } from "../../../components/modals/ModalWithCloseButton";
import { Parameter } from "../../../components/editor/components/ParameterPicker/Parameter";
import { ParameterPickerLoadingOptions, ParameterPickerV2 } from "../../../components/editor/components/ParameterPicker/ParameterPickerV2";
import { ParameterV2 } from "../../../components/editor/components/ParameterPicker/ParameterV2";
import { ParameterNodeRenderer } from "../../../components/editor/components/ParameterPicker/ParameterNodeRenderer";

const ListSchemaParameterPicker = (props: {
  rootNodes: ParameterV2[];
  selectedPath: string;
  onParameterPicked: (path: string | null, parameter: ParameterV2 | null) => void;
  pathDelimiter: string;
  pathShouldStartWithDelimiter: boolean;
}): JSX.Element => {
  const [nodes, setNodes] = useState<ParameterV2[]>(props.rootNodes);

  useEffect(() => {
    setNodes(props.rootNodes);
  }, [props.rootNodes]);

  if (nodes.length === 0) {
    return <div>Kein Schema geladen.</div>;
  }

  return (
    <>
      {nodes.map((node, index) => (
        <ParameterNodeRenderer
          key={node.parameterName + "_" + index}
          pathShouldStartWithDelimiter={props.pathShouldStartWithDelimiter}
          depth={0}
          selectedPath={props.selectedPath}
          onParameterPicked={props.onParameterPicked}
          onParameterInformationChangedThroughTextBox={(changedParameter) => {
            const newNodes = [...nodes];
            newNodes[index] = changedParameter;
            setNodes(newNodes);
          }}
          fullPath=""
          parameter={node}
          pathDelimiter={props.pathDelimiter}
        />
      ))}
    </>
  );
};

export const SharePointCreateListItemsParameterMapper = (props: {
  parameterMappings: ParameterMapping[];
  listSchemaParameters: ParameterV2[];
  onMappingChanged: (newMappings: ParameterMapping[]) => void;
}): JSX.Element => {
  const [sourceParameterPickerVisible, setSourceparameterPickerVisible] = useState(false);
  const [targetParameterPickerVisible, setTargetParameterPickerVisible] = useState(false);

  const currentTargetParameter = useRef<Parameter>(undefined);
  const currentSourceParameter = useRef<Parameter>(undefined);

  const addMapping = (): void => {
    log.debug("add mapping, check if need to add or ignored", {
      currentTarget: currentTargetParameter.current,
      currentSource: currentSourceParameter.current
    });
    if (currentSourceParameter.current !== undefined && currentTargetParameter.current !== undefined) {
      const newMappings = [...props.parameterMappings];
      newMappings.push({
        sourceParameter: currentSourceParameter.current,
        targetParameter: currentTargetParameter.current
      });
      currentSourceParameter.current = undefined;
      currentTargetParameter.current = undefined;
      props.onMappingChanged(newMappings);
    }
  };

  const rowsForMappingOverview: GridRow[] = [
    {
      cells: [
        {
          content: <h5>Formularparameter</h5>,
          uniqueKey: "headerCell1",
          widths: { smWidth: 5 }
        },
        {
          content: <h5>Listenfelder</h5>,
          uniqueKey: "headerCell2",
          widths: { smWidth: 5 }
        },
        {
          content: <>Löschen</>,
          uniqueKey: "headerCell3",
          widths: { smWidth: 2 }
        }
      ]
    },
    ...props.parameterMappings.map((p, index): GridRow => {
      return {
        cells: [
          {
            uniqueKey: "row_" + index + "_cell1",
            content: <>{p.sourceParameter.path}</>,
            widths: { smWidth: 5 }
          },
          {
            uniqueKey: "row_" + index + "_cell2",
            content: <>{p.targetParameter.path}</>,
            widths: { smWidth: 5 }
          },
          {
            uniqueKey: "row_" + index + "_cell3",
            content: (
              <>
                <ActionButton
                  text="Löschen"
                  iconProps={{ iconName: "delete" }}
                  onClick={() => {
                    const newParams = [...props.parameterMappings];
                    newParams.splice(index, 1);
                    props.onMappingChanged(newParams);
                  }}
                />
              </>
            ),
            widths: { smWidth: 2 }
          }
        ]
      };
    })
  ];

  return (
    <>
      <Grid
        gridConfig={{
          rows: [
            ...rowsForMappingOverview,
            {
              cells: [
                {
                  content: (
                    <>
                      <ActionButton
                        onClick={() => {
                          setSourceparameterPickerVisible(true);
                        }}
                        key="AddFormParameterButton"
                        text="Hinzufügen"
                        iconProps={{ iconName: "Add" }}></ActionButton>
                      {currentSourceParameter.current !== undefined && <div>{currentSourceParameter.current.path}</div>}
                      <ModalWithCloseButton
                        isOpen={sourceParameterPickerVisible === true}
                        onClose={() => {
                          setSourceparameterPickerVisible(false);
                        }}
                        title="Parameter hinzufügen">
                        <div>
                          <ParameterPickerV2
                            pathDelimiter="/"
                            pathShouldStartWithDelimiter={true}
                            selectedPath=""
                            parameterLoadingOptions={ParameterPickerLoadingOptions.FormFields | ParameterPickerLoadingOptions.DatasourceResults}
                            onParameterPicked={(path, param) => {
                              currentSourceParameter.current = path !== "" ? { path: path, type: param.type, parameterName: param.parameterName, location: param.location } : undefined;
                              addMapping();
                              setSourceparameterPickerVisible(false);
                            }}></ParameterPickerV2>
                        </div>
                      </ModalWithCloseButton>
                    </>
                  ),
                  uniqueKey: "formParams",
                  widths: { smWidth: 5 }
                },
                {
                  content: (
                    <>
                      <ActionButton
                        onClick={() => {
                          setTargetParameterPickerVisible(true);
                        }}
                        key="AddTargetParameterButton"
                        text="Hinzufügen"
                        iconProps={{ iconName: "Add" }}></ActionButton>
                      {currentTargetParameter.current !== undefined && <div>{currentTargetParameter.current.path}</div>}
                      <ModalWithCloseButton
                        title="Listenfeld auswählen"
                        isOpen={targetParameterPickerVisible === true}
                        onClose={() => {
                          setTargetParameterPickerVisible(false);
                        }}>
                        <div>
                          <ListSchemaParameterPicker
                            rootNodes={props.listSchemaParameters}
                            selectedPath=""
                            pathDelimiter="/"
                            pathShouldStartWithDelimiter={true}
                            onParameterPicked={(path, param) => {
                              currentTargetParameter.current = path !== "" ? { path: path, type: param.type, parameterName: param.parameterName, location: param.location } : undefined;
                              addMapping();
                              setTargetParameterPickerVisible(false);
                            }}
                          />
                        </div>
                      </ModalWithCloseButton>
                    </>
                  ),
                  uniqueKey: "listSchemaParams",
                  widths: { smWidth: 5 }
                },
                {
                  content: <></>,
                  uniqueKey: "headerCell2",
                  widths: { smWidth: 2 }
                }
              ]
            }
          ]
        }}></Grid>
    </>
  );
};
