import React from "react";
import { LabelWithRequiredInfo } from "../labelWithRequiredInfo";
import parse from "html-react-parser";
export const PrintalbeVersionOfTextField = (props: { renderLable?: boolean; fieldValue: string; displayName: string; required: boolean }) => {
  const valToUse = props.fieldValue === undefined || props.fieldValue === null ? "" : props.fieldValue;
  const lineBreakesReplacedHtml = valToUse.replace(/(?:\r\n|\r|\n)/g, "<br>");
  const lableShouldBeRendered = props.renderLable === null || props.renderLable === undefined || props.renderLable === true;
  return (
    <div className="inPrintOnly">
      {lableShouldBeRendered === true && (
        <>
          <LabelWithRequiredInfo required={props.required} text={props.displayName} />
        </>
      )}
      <div className={"printableContentFromTextField"}>{parse(lineBreakesReplacedHtml)} &nbsp;</div>
    </div>
  );
};
