import { ComponentConfig } from "../../componentProxy/models/componentConfig";
import { IResponsiveWidths } from "./responsiveWidths";

export interface ComponentGridCell {
  widths: IResponsiveWidths;
  componentConfig: ComponentConfig;
  uniqueIdentifier: string;
  infoText?: string;
  isEditorContainerWithBackground?: boolean;
  isDivider?: boolean;
  contentIsRightAlligned?: boolean;
}
