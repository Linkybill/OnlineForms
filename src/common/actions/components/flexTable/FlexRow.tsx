import React from "react";
import { FC, ReactNode } from "react";

export interface RowProps {
  children: ReactNode;
}

export const FlexRow: FC<RowProps> = ({ children }) => {
  return <div className="flexRow">{children}</div>;
};
