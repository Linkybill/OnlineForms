import "@fluentui/react/dist/css/fabric.css";
import { GridRow } from "./models/gridRow";
import { GridCell } from "./models/gridCell";
import { Grid } from "./grid";
import { IComponentGridProps } from "./models/componentGridProps";
import log from "loglevel";
import { ComponentProxy } from "../componentProxy/ComponentProxy";
import * as React from "react";

export function ComponentGrid(props: IComponentGridProps): JSX.Element {
  const gridRows = props.gridConfig.rows.map((myRow): GridRow => {
    const cells: GridCell[] = myRow.cells.map((myCell, cellIndex): GridCell => {
      const componentToRender = <ComponentProxy componentConfig={myCell.componentConfig}></ComponentProxy>;

      return {
        uniqueKey: myCell.uniqueIdentifier,
        content: <>{componentToRender}</>,
        widths: myCell.widths,
        infoText: myCell.infoText,
        isDivider: myCell.isDivider,
        contentIsRightAlligned: myCell.contentIsRightAlligned
      };
    });
    return {
      cells: cells
    };
  });

  log.debug("rendering componentGrid with ", gridRows);
  return (
    <Grid
      gridConfig={{
        rows: gridRows,
        rowStyles: props.gridConfig.rowStyles,
        cellStyles: props.gridConfig.cellStyles
      }}></Grid>
  );
}
