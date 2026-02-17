import { ComponentConfigProps } from "./componentConfigProps";
import { componentNames } from "./componentNames";

export interface ComponentConfig {
  name: componentNames;
  props: ComponentConfigProps;
  uniqueComponentIdentifier?: string;
  isEditorSection?: boolean;
  isDivider?: boolean;
}
