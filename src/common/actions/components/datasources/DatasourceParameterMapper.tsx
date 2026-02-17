import { useRef, useState } from "react";
import React from "react";
import log from "loglevel";
import { ActionButton } from "@fluentui/react";
import { ParameterMapping } from "../../models/datasources/ParameterMapping";
import { Grid } from "../../../components/grid/grid";
import { GridRow } from "../../../components/grid/models/gridRow";
import { ModalWithCloseButton } from "../../../components/modals/ModalWithCloseButton";
import { Parameter } from "../../../components/editor/components/ParameterPicker/Parameter";
import { ParameterPickerLoadingOptions, ParameterPickerV2 } from "../../../components/editor/components/ParameterPicker/ParameterPickerV2";

export const DatasourceParameterMapper = (props: {
  sourceHeadline: string;
  targetHeadline: string;
  parameterMappings: ParameterMapping[];
  expandedSourceNodePaths: string[];
  expandedTargetNodePaths: string[];
  datasourceIdForWhichParameterNeesToBeMapped: string;
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

  log.debug("rendering parameterMapper with parameter: ", { expandedPaths: props.expandedSourceNodePaths });

  const rowsForMappingOverview: GridRow[] = [
    {
      cells: [
        {
          content: <h5>{props.sourceHeadline}</h5>,
          uniqueKey: "headerCell1",
          widths: { smWidth: 5 }
        },
        {
          content: <h5>{props.targetHeadline}</h5>,
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
                        title="hinzufügen">
                        <div>
                          <ParameterPickerV2
                            pathDelimiter="/"
                            pathShouldStartWithDelimiter={true}
                            selectedPath={props.expandedSourceNodePaths.length > 0 ? props.expandedSourceNodePaths[0] : ""}
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
                        key="AddFormOutputParameterButton"
                        text="Hinzufügen"
                        iconProps={{ iconName: "Add" }}></ActionButton>
                      {currentTargetParameter.current !== undefined && <div>{currentTargetParameter.current.path}</div>}

                      <ModalWithCloseButton
                        title="Datenquellparameter mapping"
                        isOpen={targetParameterPickerVisible === true}
                        onClose={() => {
                          setTargetParameterPickerVisible(false);
                        }}>
                        <div>
                          <ParameterPickerV2
                            pathDelimiter="/"
                            pathShouldStartWithDelimiter={true}
                            datasourceIdForWhichParameterShouldBeCreated={props.datasourceIdForWhichParameterNeesToBeMapped}
                            selectedPath={props.expandedSourceNodePaths.length > 0 ? props.expandedTargetNodePaths[0] : ""}
                            parameterLoadingOptions={ParameterPickerLoadingOptions.DatasourceInputParameters}
                            onParameterPicked={(path, param) => {
                              currentTargetParameter.current = path !== "" ? { path: path, type: param.type, parameterName: param.parameterName, location: param.location } : undefined;
                              addMapping();
                              setTargetParameterPickerVisible(false);
                            }}></ParameterPickerV2>
                        </div>
                      </ModalWithCloseButton>
                    </>
                  ),
                  uniqueKey: "formParams",
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
