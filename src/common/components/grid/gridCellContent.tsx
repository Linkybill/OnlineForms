import React from "react";
import { FieldsAreLockedContextProvider, useFieldsAreLockedInfoContext } from "../../helper/FieldsAreLockedInfoContext";
import { useEditorContext } from "../../helper/EditorContext";
import { useListItemContext } from "../../helper/ListItemContext";
import log from "loglevel";
import { GridCell } from "./models/gridCell";
import { ClassNames } from "../../configuration/GridClassNames";
import { WithHelpText } from "../helpComponent/withHelpText";

export const GridCellContent = (props: { cell: GridCell; cellStyles: React.CSSProperties }): JSX.Element => {
  const fieldsAreLockedContext = useFieldsAreLockedInfoContext();
  const editorContext = useEditorContext();
  const itemContext = useListItemContext();

  const getResponsiveWidthsString = (cell: GridCell): string => {
    const smallWidthString = cell.widths.smWidth !== undefined ? ClassNames.gridStyleClassNames.smallClassNamesOneUntilTwelve[cell.widths.smWidth - 1] : "";

    const mdWidhString: string = cell.widths.mdWidth !== undefined ? ClassNames.gridStyleClassNames.mdClassNamesFromOneUntilTwelve[cell.widths.mdWidth - 1] : "";
    const lgWidhString: string = cell.widths.lgWidth !== undefined ? ClassNames.gridStyleClassNames.lgClassNamesFromOneUntilTwelve[cell.widths.lgWidth - 1] : "";

    const xlWidhString: string = cell.widths.xlWidth !== undefined ? ClassNames.gridStyleClassNames.xlClassNamesFromOneUntilTwelve[cell.widths.xlWidth - 1] : "";

    const xxlWidhString: string = cell.widths.xxlWidth !== undefined ? ClassNames.gridStyleClassNames.xxlClassNamesFromOneUntilTwelve[cell.widths.xxlWidth - 1] : "";

    const xxxlWidhString: string = cell.widths.xxxlWidth !== undefined ? ClassNames.gridStyleClassNames.xxxlClassNamesFromOneUntilTwelve[cell.widths.xxxlWidth - 1] : "";

    return (smallWidthString + " " + mdWidhString + " " + lgWidhString + " " + xlWidhString + " " + xxlWidhString + " " + xxxlWidhString).trim().replace("  ", " ");
  };

  let isHidden = false;
  isHidden = itemContext.isConditionHiddenFullfilled(props.cell.uniqueKey, false);

  let fieldsAreLocked = itemContext.isConditionLockedFullfilled(props.cell.uniqueKey, false);
  const lockedWhenConditionGetsOverwritten = itemContext.doesHaveConditionLockedStrnig(props.cell.uniqueKey);
  if (lockedWhenConditionGetsOverwritten !== true) {
    fieldsAreLocked = fieldsAreLockedContext.fieldsAreLocked;
  }

  const className = ClassNames.gridStyleClassNames.cellClassName + " " + getResponsiveWidthsString(props.cell);

  const content: JSX.Element = (
    <div
      key={"cellWrapper"}
      style={{
        ...props.cellStyles,
        display: isHidden === true && (editorContext === undefined || editorContext.isInEditMode !== true) ? "none" : undefined
      }}
      className={className + "" + (props.cell.isDivider === true ? " divider" : "") + (props.cell.contentIsRightAlligned === true ? " allignedRight" : "")}>
      <div className="cellPaddingWrapper">
        <WithHelpText shouldShowHelpText={true} helpText={props.cell.infoText ? props.cell.infoText : ""} title="" classIdentifier="gridInfo">
          {props.cell.content}
        </WithHelpText>
      </div>
    </div>
  );
  return (
    <FieldsAreLockedContextProvider key={"lockedContentProvider"} locked={fieldsAreLocked === true}>
      {content}
    </FieldsAreLockedContextProvider>
  );
};
