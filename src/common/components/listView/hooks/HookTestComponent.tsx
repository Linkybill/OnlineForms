import React from "react";

export const HookTestComponent = (props: { testCall: () => void }): JSX.Element => {
  props.testCall();
  return <></>;
};
