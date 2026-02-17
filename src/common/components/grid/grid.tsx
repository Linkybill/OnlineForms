import "office-ui-fabric-react/dist/css/fabric.css";
import { GridConfig } from "./gridConfig";
import * as React from "react";
import { ClassNames } from "../../configuration/GridClassNames";
import { GridCellContent } from "./gridCellContent";
export interface IGridProps {
  gridConfig: GridConfig;
  gridClassname?: string;
}

export const Grid = (props: IGridProps): JSX.Element => {
  const gridRows = props.gridConfig.rows.map((row, rowIndex): JSX.Element => {
    const cellContents = row.cells.map((cell, cellIndex): JSX.Element => {
      return <GridCellContent key={"row_" + rowIndex + "cell_" + cellIndex} cell={cell} cellStyles={props.gridConfig.cellStyles} />;
    });
    return (
      <div key={"gridRow_" + rowIndex} className={ClassNames.gridStyleClassNames?.rowClassName} style={props.gridConfig.rowStyles}>
        {cellContents}
      </div>
    );
  });

  return (
    <div className={ClassNames.gridStyleClassNames.gridClassName + " " + props.gridClassname} dir="ltr">
      {gridRows}
    </div>
  );
};
