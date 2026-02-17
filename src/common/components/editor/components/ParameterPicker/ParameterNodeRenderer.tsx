import React, { useEffect, useState } from "react";
import { ParameterV2 } from "./ParameterV2";
import { FlexRow } from "../../../../actions/components/flexTable/FlexRow";
import { FlexCell } from "../../../../actions/components/flexTable/FlexCell";
import { ActionButton, Checkbox, TextField } from "@fluentui/react";
import { useParameterInformationContext } from "../conditionEditor/ParameterInformationContext";
import { FieldTypeNames } from "../../../../listItem/FieldTypeNames";
import { LogicParameterType } from "../conditionEditor/Models/OperationValidationModel";
import { FlexTable } from "../../../../actions/components/flexTable/FlexTable";

export const ParameterNodeRenderer = (props: {
  selectedPath: string;
  depth?: number;
  onParameterPicked: (path: string | null, parameter: ParameterV2 | null) => void;
  onParameterInformationChangedThroughTextBox: (changedParameter: ParameterV2) => void;
  fullPath: string;
  parameter: ParameterV2;
  pathDelimiter: string;
  pathShouldStartWithDelimiter: boolean;
}) => {
  let currentFullPath = props.parameter.parameterName !== "" ? props.fullPath + props.pathDelimiter + props.parameter.parameterName : props.fullPath;
  if (props.pathShouldStartWithDelimiter === false && currentFullPath.startsWith(props.pathDelimiter)) {
    currentFullPath = currentFullPath.replace(props.pathDelimiter, "");
  }
  const currentDepth = props.depth == undefined ? 0 : props.depth;

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [furtherPropsGotLoaded, setFurtherPropsGotLoaded] = useState<boolean>(false);
  const parameterInfo = useParameterInformationContext();

  const compatibelParameterTypes: { [key in LogicParameterType]: string[] } = {
    any: ["all"],
    array: [FieldTypeNames.List, FieldTypeNames.CustomTemplatedEntity, FieldTypeNames.Choice, FieldTypeNames.MultiChoice, FieldTypeNames.User, FieldTypeNames.UserMulti],
    boolean: [FieldTypeNames.Boolean],
    date: [FieldTypeNames.DateTime],
    null: ["all"],
    number: [FieldTypeNames.Number, FieldTypeNames.Currency],
    string: [FieldTypeNames.Number, FieldTypeNames.Text, FieldTypeNames.Currency, FieldTypeNames.Note],
    undefined: ["all"],
    void: []
  };

  const expectedParameterType = parameterInfo.expectedParameterType;
  const parameterIsSelectable =
    expectedParameterType in compatibelParameterTypes &&
    (compatibelParameterTypes[expectedParameterType].indexOf("all") > -1 || compatibelParameterTypes[expectedParameterType].indexOf(props.parameter.type as string) > -1);
  const hasSelectedPath = props.selectedPath !== undefined && props.selectedPath !== null && props.selectedPath !== "";
  useEffect(() => {
    const currentSplittedPaths = props.selectedPath !== null && props.selectedPath !== undefined ? props.selectedPath.split(props.pathDelimiter) : [];
    if (props.parameter.pathIsEditableThroughTextField === true) {
      if (currentDepth <= currentSplittedPaths.length - 1) {
        const valueForTextBox = currentSplittedPaths[currentDepth];
        props.onParameterInformationChangedThroughTextBox({ ...props.parameter, parameterName: valueForTextBox });
      }
    }
  }, []);

  const toggleExpand = () => {
    setIsExpanded((old) => {
      return !old;
    });
  };
  const placeholderWidth = currentDepth + 1 * 40;
  return (
    <FlexTable>
      <FlexRow>
        <FlexCell>
          <div style={{ display: "flex", alignItems: "center", paddingLeft: currentDepth * 20 }}>
            {props.parameter.children && props.parameter.children.length > 0 ? (
              <ActionButton
                onClick={toggleExpand}
                iconProps={{
                  iconName: isExpanded ? "ChevronDownSmall" : "ChevronRightSmall"
                }}
                styles={{ root: { marginRight: 8 } }} // Abstand zwischen Icon und Checkbox
              />
            ) : (
              // Platzhalter für die Einrückung
              <div style={{ display: "flex", alignItems: "center", paddingLeft: placeholderWidth }}></div>
            )}
            <Checkbox
              checked={hasSelectedPath && currentFullPath === props.selectedPath}
              label={props.parameter.pathIsEditableThroughTextField ? undefined : props.parameter.displayName !== undefined ? props.parameter.displayName : props.parameter.parameterName}
              disabled={parameterIsSelectable !== true}
              onRenderLabel={
                props.parameter.pathIsEditableThroughTextField
                  ? () => (
                      <TextField
                        value={props.parameter.parameterName}
                        onChange={(ev, newVal) => {
                          props.onParameterInformationChangedThroughTextBox({
                            ...props.parameter,
                            parameterName: newVal
                          });
                        }}
                      />
                    )
                  : undefined
              }
              onChange={(ev, val) => {
                if (val === true) {
                  const pathToUse = props.parameter.parameterName === "" ? "" : currentFullPath;
                  props.onParameterPicked(pathToUse, props.parameter);
                } else {
                  props.onParameterPicked(null, null);
                }
              }}
            />
            {props.parameter.isExpandable === true && !furtherPropsGotLoaded && (
              <ActionButton
                text="Weitere Properties nachladen"
                onClick={() => {
                  const newNodes = props.parameter.resolveChildren();
                  const newParameter: ParameterV2 = { ...props.parameter, children: newNodes };
                  props.onParameterInformationChangedThroughTextBox(newParameter);
                  setFurtherPropsGotLoaded(true);
                }}
              />
            )}
          </div>
        </FlexCell>
      </FlexRow>
      {props.parameter.children && props.parameter.children.length > 0 && isExpanded && (
        <FlexRow>
          <FlexCell>
            {props.parameter.children.map((p, index) => (
              <ParameterNodeRenderer
                pathShouldStartWithDelimiter={props.pathShouldStartWithDelimiter}
                depth={currentDepth + 1}
                selectedPath={props.selectedPath}
                onParameterPicked={props.onParameterPicked}
                onParameterInformationChangedThroughTextBox={(changedParameter) => {
                  const newChildren = [...props.parameter.children];
                  newChildren[index] = changedParameter;
                  props.onParameterInformationChangedThroughTextBox({ ...props.parameter, children: newChildren });
                }}
                fullPath={currentFullPath}
                parameter={p}
                pathDelimiter={props.pathDelimiter}
              />
            ))}
          </FlexCell>
        </FlexRow>
      )}
    </FlexTable>
  );
};
