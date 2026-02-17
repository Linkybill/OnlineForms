import React from "react";
import { LabelWithRequiredInfo } from "../../listItem/labelWithRequiredInfo";

export const DisabledTextField = (props: { inPrintOnly: boolean; required: boolean; labelShouldBeRendered: boolean; label: string; text: string }) => {
  return (
    <div className={props.inPrintOnly ? "inPrintOnly" : ""}>
      {props.labelShouldBeRendered === true && (
        <>
          <LabelWithRequiredInfo required={props.required} text={props.text} />
        </>
      )}
      <div className={"printableContentFromTextField"}>{props.text} &nbsp;</div>
    </div>
  );
};
