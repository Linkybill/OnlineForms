import { Icon, IIconProps } from "@fluentui/react";
import * as React from "react";

export const ComponentDescription = (props: { title: string; description: string; iconPorps?: IIconProps; canBeDragged: boolean }): JSX.Element => {
  return (
    <div
      style={{
        margin: "5px",
        padding: "5px",
        borderColor: "gray",
        borderStyle: "solid",
        borderWidth: 1,
        float: "left",
        textAlign: "center",
        opacity: props.canBeDragged === false ? "0.5" : undefined,
        backgroundColor: props.canBeDragged === false ? "lightGreen" : undefined
      }}
    >
      <Icon {...props.iconPorps} title={props.title}></Icon>
      <br />
      <code style={{ fontSize: "11px" }}>{props.title}</code>
    </div>
  );
};
