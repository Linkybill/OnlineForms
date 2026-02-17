import { ActionButton } from "@fluentui/react";
import React from "react";

export const OkAndCancelButton = (props: {
  okButtonIconName: string;
  showOkButton: boolean;
  onOkClicked?: () => void;
  onCancelClicked?: () => void;
  okButtonText: string;
  cancelButtonText: string;
  showCancelButton: boolean;
}): JSX.Element => {
  return (
    <div
      style={{
        float: "right",
        marginRight: "4em",
        marginTop: "2em",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
      {props.showOkButton === true && <ActionButton text="Speichern" iconProps={{ iconName: props.okButtonIconName }} onClick={props.onOkClicked}></ActionButton>}
      {props.showCancelButton === true && <ActionButton text="Abbrechen" iconProps={{ iconName: "Cancel" }} style={{ marginLeft: "1em", marginTop: "2px" }} onClick={props.onCancelClicked}></ActionButton>}
    </div>
  );
};
