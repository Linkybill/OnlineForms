import { IconButton } from "@fluentui/react";
import React from "react";

export interface IPaginationProps {
  hasNext: boolean;
  hasPrevious: boolean;
  onPreviousPageClicked: () => Promise<void>;
  onNextPageClicked: () => Promise<void>;
  nextButtonLabel: string;
  previousButtonLabel: string;
}
export const Pagination: (props: IPaginationProps) => JSX.Element = (
  props: IPaginationProps
) => {
  return (
    <div>
      <IconButton
        iconProps={{
          iconName: "NavigateBack",
        }}
        title={props.previousButtonLabel}
        ariaLabel={props.previousButtonLabel}
        disabled={!props.hasPrevious}
        onClick={props.onPreviousPageClicked}
      />

      <IconButton
        iconProps={{
          iconName: "NavigateBackMirrored",
        }}
        title={props.nextButtonLabel}
        ariaLabel={props.nextButtonLabel}
        disabled={!props.hasNext}
        onClick={props.onNextPageClicked}
      />
    </div>
  );
};
