import { Label } from "@fluentui/react";
import React from "react";

export const LabelWithRequiredInfo = (props: { className?: string; required: boolean; text: string }): JSX.Element => {
  let className = "label";
  if (props.required === true) {
    className += " required";
  }
  if (props.className !== undefined) {
    className += " " + props.className;
  }
  return <Label className={className}>{props.text}</Label>;
};
