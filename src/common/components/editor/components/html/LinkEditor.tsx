import React, { useRef, useState } from "react";

import { ActionButton, ITextField, TextField } from "@fluentui/react";
import { Link } from "./Link";
import { TextFieldWithParameterPicker } from "./TextFieldWithParameterPicker";
import { ParameterPickerLoadingOptions } from "../ParameterPicker/ParameterPickerV2";

export const LinkEditor = (props: { linkToEdit: Link; onLinkApproved: (approvedLink: Link) => void }) => {
  const [currentHRef, setCurrentHRef] = useState<string>(props.linkToEdit.href);
  const [currentTitle, setCurrentTitle] = useState<string>(props.linkToEdit.title);
  const [target, setTarget] = useState<string>(props.linkToEdit.target);
  return (
    <>
      <TextFieldWithParameterPicker
        parameterLoadingOptions={ParameterPickerLoadingOptions.FormFields}
        pathDelimiter="."
        pathShouldStartWithDelimiter={false}
        onApprove={(val) => {
          setCurrentHRef(val);
        }}
        label="Url"
        value={currentHRef}
      />
      <TextFieldWithParameterPicker
        pathDelimiter="."
        pathShouldStartWithDelimiter={false}
        onApprove={(val) => {
          setCurrentTitle(val);
        }}
        label="Text"
        value={currentTitle}
        parameterLoadingOptions={ParameterPickerLoadingOptions.FormFields}
      />

      <TextField
        label="Target"
        value={target}
        onChange={(ev, val) => {
          setTarget(val);
        }}></TextField>

      <ActionButton
        text="OK"
        onClick={() => {
          const newLink: Link = {
            target: target,
            href: currentHRef,
            title: currentTitle !== "" ? currentTitle : currentHRef
          };
          props.onLinkApproved(newLink);
        }}></ActionButton>
    </>
  );
};
