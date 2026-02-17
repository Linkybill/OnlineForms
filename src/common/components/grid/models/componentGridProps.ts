import { ComponentConfig } from "../../componentProxy/models/componentConfig";
import { ComponentGridConfig } from "./componentGridConfig";

export interface IComponentGridProps {
  uniqueKey: string;
  gridConfig: ComponentGridConfig;
  onComponentUpdated?: (config: ComponentConfig) => void;
}
