import React, { FC, ReactNode } from "react";

export interface FlexTableProps {
  children: ReactNode;
}

export const FlexTable: FC<FlexTableProps> = ({ children }) => {
  return <div className="flexTable">{children}</div>;
};
