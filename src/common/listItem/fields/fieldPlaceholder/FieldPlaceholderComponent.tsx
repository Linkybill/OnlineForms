import * as React from "react";
import { FieldPlaceholderProps } from "./FieldPlaceholderProps";

export const FieldPlaceholderComponent: (props: FieldPlaceholderProps) => JSX.Element = (props) => {
  return <>field placeholder {props.displayName}</>;
};
