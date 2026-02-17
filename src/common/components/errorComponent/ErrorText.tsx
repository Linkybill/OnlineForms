import React from "react";

export const ErrorText = (props: { error: string }): JSX.Element => {
  return <div className="errorText">{props.error}</div>;
};
