import { FieldFileTypeRenderer, FieldNameRenderer } from "@pnp/spfx-controls-react";
import log from "loglevel";
import { IFileFieldProps } from "./FileFieldProps";
import * as React from "react";

export const DocIconField = (props: IFileFieldProps): JSX.Element => {
  log.debug("rendering filefield " + props.fieldDescription.internalName, props);

  return <FieldFileTypeRenderer path={props.fieldValue.fileName} isFolder={false}></FieldFileTypeRenderer>;
};
