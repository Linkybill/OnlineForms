import { TreeViewNode, TreeViewNodeWithFullPath } from "../models/TreeViewNode";

export const createTreeViewNodesWithPath = <TData>(nodes: TreeViewNode<TData>[], currentCreatedNodes: TreeViewNodeWithFullPath<TData>[], path: string): TreeViewNodeWithFullPath<TData>[] => {
  const nodesToReturn: TreeViewNodeWithFullPath<TData>[] = [];
  const mappedObjects = nodes.map((n): TreeViewNodeWithFullPath<TData> => {
    const nodePath = path + "/" + n.nameInPath;
    return {
      ...n,

      children: n.children !== undefined ? createTreeViewNodesWithPath(n.children, currentCreatedNodes, nodePath) : [],
      fullPath: nodePath,
      onRender: n.onRender
    };
  });
  nodesToReturn.push(...mappedObjects);
  return nodesToReturn;
};
