import * as React from "react";

export interface ITestComponentProps {
  view: string;
  config: string;
}

export function TestComponent(props: ITestComponentProps) {
  return (
    <div style={{ border: "1px solid #f00" }}>
      <h1>View: {props.view}</h1>
      <p>Config: {props.config}</p>
    </div>
  );
}
