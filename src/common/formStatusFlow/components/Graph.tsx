import React, { useEffect } from "react";
import mermaid from "mermaid";
import styles from "../components/FormStatusFlow.module.scss";
import { IGraphNode } from "../models/GraphResponse";
export const Graph = (props: { graphData: IGraphNode[] }): JSX.Element => {
  useEffect(() => {
    mermaid.contentLoaded();
  });
  mermaid.initialize({
    startOnLoad: true,
    theme: "default",
    securityLevel: "loose",

    themeCSS: `
    
    g.node rect {
      position:relative;
      fill: rgb(173, 216, 230);
      stroke: rgb(0, 216, 230);
      border-radius:0.5em;
     
      
    } 
    g.node text {
      fill: #FF0000;
      width:500px;
      display: block;
    }
    g.classGroup line {
      stroke: #f8f8f2;
      stroke-width: 0.5;
    }
    .classLabel .box {
      stroke: #21222c;
      stroke-width: 3;
      fill:#FF0000;
      opacity: 1;
    }
    .classLabel .label {
      fill: #f1fa8c;
    }
    .relation {
      stroke: #ff79c6;
      stroke-width: 1;
    }
    #compositionStart, #compositionEnd {
      fill: #FF0000;
      stroke: #bd93f9;
      stroke-width: 1;
    }
    #aggregationEnd, #aggregationStart {
      fill: #FF0000;
      stroke: #50fa7b;
      stroke-width: 1;
    }
    #dependencyStart, #dependencyEnd {
      fill: #FF0000;
      stroke: #FF0000;
      stroke-width: 1;
    } 
    #extensionStart, #extensionEnd {
      fill: #FF0000;
      stroke: #f8f8f2;
      stroke-width: 1;
    }`,
    fontFamily: "Fira Code"
  });

  const mapContainerToMermaidString = (status: IGraphNode, id: number): string => {
    return "id" + id + "[<div style='width:500px'><div style='font-size: 18px'><span style='font-weight:bold'> " + status.Title + "</span></div> <div style='font-size:12px'>" + status.Text + "</div></div>]";
  };
  const mapToContainersToMermaidString = (status: IGraphNode[]): string => {
    const strings = status.map((status, index) => mapContainerToMermaidString(status, index));
    return strings.join("-->");
  };
  let currentItemIndex = -1;
  const containerStrings = mapToContainersToMermaidString(props.graphData);
  props.graphData.forEach((container, index) => {
    if (container.IsCurrent === true) {
      currentItemIndex = index;
    }
  });
  const styleInfo: string =
    currentItemIndex !== -1
      ? ` 
    style id${currentItemIndex} stroke:#FF0000,stroke-width:4px`
      : "";

  const chart = `flowchart TD
     ${containerStrings} 
     ${styleInfo}`;

  return <div className={"mermaid " + styles.container}>{chart}</div>;
};
