import { ComponentGridRow } from "./componentGridRow";

export interface ComponentGridConfig {
  rows: ComponentGridRow[];
  rowStyles?: React.CSSProperties;
  cellStyles?: React.CSSProperties;
}
