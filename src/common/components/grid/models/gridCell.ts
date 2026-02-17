import { IResponsiveWidths } from "./responsiveWidths";

export interface GridCell {
  widths: IResponsiveWidths;
  uniqueKey: string;
  content: JSX.Element;
  infoText?: string;
  isEditorContainerWithBackground?: boolean;
  isDivider?: boolean;
  contentIsRightAlligned?: boolean;
}
