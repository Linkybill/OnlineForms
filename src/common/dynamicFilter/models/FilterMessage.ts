import { Filter } from "./Filter";

export interface FilterMessage {
  datasourceId: string;
  filter: Filter[];
  overwriteFilterInTarget?: boolean;
}
