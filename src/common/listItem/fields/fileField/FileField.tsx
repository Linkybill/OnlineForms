import log from "loglevel";
import { IFileFieldProps } from "./FileFieldProps";
import * as React from "react";

export const FileField = (props: IFileFieldProps): JSX.Element => {
  log.debug("rendering filefield " + props.fieldDescription.internalName, props);

  return (
    <a target="_blank" href={props.fieldValue.url}>
      {props.fieldValue.title ? props.fieldValue.title : props.fieldValue.fileName}
    </a>
  );
};
