import React, { FC, ReactNode } from "react";

export interface FlexCellProps {
  children: ReactNode;
  className?: string;
}
export const FlexCell: FC<FlexCellProps> = (props) => {
  return <div className={"flexCell" + props.className !== null ? props.className : ""}>{props.children}</div>;
};
