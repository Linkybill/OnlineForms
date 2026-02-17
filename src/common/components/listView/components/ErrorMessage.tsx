import { MessageBar, MessageBarType } from "@fluentui/react";
import React from "react";

export interface IErrorMessageProps {
  error: string | undefined;
}
export const ErrorMessage: (props: IErrorMessageProps) => JSX.Element = (
  props: IErrorMessageProps
) => {
  return (
    <>
      {props.error && (
        <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline={false}
          dismissButtonAriaLabel="schließen"
        >
          {props.error}
        </MessageBar>
      )}{" "}
    </>
  );
};
