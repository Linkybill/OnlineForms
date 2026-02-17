import React, { useEffect, useRef, useState } from "react";
import { TreeViewNode, TreeViewNodeWithFullPath } from "../models/TreeViewNode";
import log from "loglevel";
import { TreeNode } from "./TreeNode";
import { createTreeViewNodesWithPath } from "../mapper/TreeNodeToTreeNodeWithPathMapper";
import { TreeViewWithFullPath } from "./TreeViewWithFullPath";

export interface TreeViewProps<T> {
  nodes: TreeViewNode<T>[];
  children?: JSX.Element;
  expandedNodePaths?: string[];
}

export const TreeView = <TNodeData,>(props: TreeViewProps<TNodeData>): JSX.Element => {
  useEffect(() => {
    const nodesWithPath = createTreeViewNodesWithPath(props.nodes, [], "");
    log.debug("created nodes with path,", nodesWithPath);
    setNodesWithPaths(nodesWithPath);
  }, [JSON.stringify(props.nodes)]);

  const [nodesWithPaths, setNodesWithPaths] = useState<TreeViewNodeWithFullPath<TNodeData>[]>([]);

  log.debug("rendering TreeView with", { props: props });
  return <TreeViewWithFullPath nodesWithPath={nodesWithPaths} expandedNodePaths={props.expandedNodePaths}></TreeViewWithFullPath>;
};
