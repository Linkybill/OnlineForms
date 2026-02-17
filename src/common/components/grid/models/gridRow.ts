import { GridCell } from "./gridCell";

export interface GridRow {
  gridRowClassName?: string;
  cells: GridCell[];
}
