import { CSSProperties } from "react";
import { ComponentConfig } from "../componentProxy/models/componentConfig";

export interface IRegisterProps {
  uniqueKey: string;
  registerConfigs: RegisterConfig[];
  view: "accordion" | "tabs";
  onComponentUpdated?: (componentConfig: ComponentConfig) => void;
}

/**
 * Type definition of a RegisterConfig object
 */
export interface RegisterConfig {
  title: string;
  link?: string;
  style?: CSSProperties;
  isVisible: boolean;
  componentConfig: ComponentConfig;
}
