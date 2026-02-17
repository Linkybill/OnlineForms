import { ComponentConfig } from "../componentProxy/models/componentConfig";

export interface IFieldSetProps {
  uniqueKey: string;
  onComponentUpdated?: (componentProps: ComponentConfig) => void;
  placeholderMappings?: {};
  lineWidth?: number;
  headerWidth?: number;
  headerColor?: string;
  title: string;
  componentConfig?: ComponentConfig;
}
