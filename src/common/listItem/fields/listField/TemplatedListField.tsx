import React from "react";
import { IListFieldProps } from "./ListField";
import parse from "html-react-parser";
import log from "loglevel";
const format: any = require("string-template");
export const TemplatedListField = (props: IListFieldProps) => {
  log.debug("rendering TemplatedListField " + props.fieldDescription.internalName + " with props", props);
  if (props.fieldValue === undefined || props.fieldValue === null) {
    return <></>;
  }
  if (props.fieldDescription.itemTemplate === undefined || props.fieldDescription.itemTemplate === "") {
    return <>no template</>;
  }

  const itemElements: string[] = props.fieldValue.map((val): string => {
    const unTemplatedHtml: string = typeof val === "string" ? format(props.fieldDescription.itemTemplate, [val]) : format(props.fieldDescription.itemTemplate, val);
    return unTemplatedHtml;
  });

  const completeHtml = props.fieldDescription.outerTemplate !== undefined && props.fieldDescription.outerTemplate !== "" ? format(props.fieldDescription.outerTemplate, [itemElements.join("")]) : itemElements.join("");

  return <>{parse(completeHtml)}</>;
};
