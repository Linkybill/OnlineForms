import { CSSProperties } from "react";
import { GridRow } from "./models/gridRow";

export interface GridConfig {
  cellStyles?: CSSProperties;
  rowStyles?: CSSProperties;
  rows: GridRow[];
}
