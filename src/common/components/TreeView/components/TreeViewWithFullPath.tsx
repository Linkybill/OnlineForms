import React from "react";
import { TreeNode } from "./TreeNode";
import { TreeViewNodeWithFullPath } from "../models/TreeViewNode";

export interface TreeViewWithFullPathProps<TNodeData> {
  nodesWithPath: TreeViewNodeWithFullPath<TNodeData>[];
  expandedNodePaths?: string[];
}

export const TreeViewWithFullPath = <TNodeData,>(props: TreeViewWithFullPathProps<TNodeData>): JSX.Element => {
  return (
    <ul>
      {props.nodesWithPath.map((n, index): JSX.Element => {
        return <TreeNode key={index} {...n} />;
      })}
    </ul>
  );
};
