import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createContext } from "react";
import { TreeViewNode, TreeViewNodeWithFullPath } from "../models/TreeViewNode";
import { SelectionMode } from "../models/SelectionMode";
import log from "loglevel";

export interface TreeViewContext<TNodeData> {
  registerSelectedNode: (node: TreeViewNodeWithFullPath<TNodeData>) => void;
  toggleExpand: (path) => void;
  isPathExpanded: (path) => boolean;
  toggleSelect: (treeNode: TreeViewNodeWithFullPath<TNodeData>) => void;
  isPathSelected: (path) => boolean;
  selectedPaths: string[];
  getSelectedNodes: () => TreeViewNodeWithFullPath<TNodeData>[];
}

const TreeViewSelectionContext = createContext<TreeViewContext<any>>({
  toggleExpand: () => {
    throw new Error("Function not implemented.");
  },
  isPathExpanded: () => {
    throw new Error("Function not implemented.");
  },
  toggleSelect: function (treeNode: TreeViewNodeWithFullPath<any>): void {
    throw new Error("Function not implemented.");
  },
  getSelectedNodes: function (): TreeViewNodeWithFullPath<any>[] {
    throw new Error("Function not implemented.");
  },
  isPathSelected: function (path: any): boolean {
    throw new Error("Function not implemented.");
  },
  selectedPaths: [],
  registerSelectedNode: function (node: TreeViewNodeWithFullPath<any>): void {
    throw new Error("Function not implemented.");
  }
});

export const UseTreeViewSelectionContext = () => React.useContext(TreeViewSelectionContext);

export const TreeViewSelectionContextProvider = (props: {
  expandedPaths: string[];
  allNodes: TreeViewNodeWithFullPath<any>[];
  selectionMode: SelectionMode;
  selectedPaths: string[];
  children?: JSX.Element[] | JSX.Element;
}) => {
  const [selectedPaths, setSelectedPaths] = useState(props.selectedPaths === undefined ? [] : props.selectedPaths);
  const [expandedPaths, setExpandedPaths] = useState<string[]>(props.expandedPaths);

  const currentSelectedNodes = useRef<TreeViewNodeWithFullPath<any>[]>([]);

  useEffect(() => {
    setExpandedPaths((old) => {
      const defaultPathdelimiter = "/";
      const defaultExpandedPaths: string[] = [];
      if (props.expandedPaths !== undefined) {
        props.expandedPaths.forEach((expandedPath) => {
          const pathSplittedBySlash = expandedPath.split(defaultPathdelimiter);
          let fullPath = "";
          pathSplittedBySlash.forEach((splittedPath) => {
            if (splittedPath !== "") {
              fullPath += defaultPathdelimiter + splittedPath;
              defaultExpandedPaths.push(fullPath);
            }
          });
        });
      }

      return defaultExpandedPaths;
    });
  }, [JSON.stringify(props.expandedPaths)]);
  return (
    <TreeViewSelectionContext.Provider
      value={{
        registerSelectedNode: (node): void => {
          const alreadyRegistered = currentSelectedNodes.current.filter((node) => node.fullPath === node.fullPath).length > -1;
          if (alreadyRegistered === false) {
            currentSelectedNodes.current = [...currentSelectedNodes.current, node];
          }
        },
        toggleExpand: (path: string) => {
          setExpandedPaths((old) => {
            return old.indexOf(path) > -1 ? old.filter((p) => p !== path) : [...old, path];
          });
        },
        isPathExpanded: (path: string) => {
          return expandedPaths.indexOf(path) > -1;
        },

        isPathSelected: (path: string): boolean => {
          return selectedPaths.indexOf(path) > -1;
        },
        selectedPaths: selectedPaths,
        getSelectedNodes: () => {
          return currentSelectedNodes.current;
        },
        toggleSelect: (node: TreeViewNodeWithFullPath<any>): void => {
          if (props.selectionMode === "multiple") {
            currentSelectedNodes.current =
              currentSelectedNodes.current.filter((n) => n.fullPath === node.fullPath).length > 0 ? currentSelectedNodes.current.filter((n) => n.fullPath !== node.fullPath) : [...currentSelectedNodes.current, node];

            setSelectedPaths((old) => {
              return old.filter((path) => path === node.fullPath).length > 0 ? old.filter((path) => path !== node.fullPath) : [...old, node.fullPath];
            });
          } else {
            currentSelectedNodes.current = currentSelectedNodes.current.filter((n) => n.fullPath === node.fullPath).length > 0 ? [] : [node];
            setSelectedPaths((old) => {
              return old.filter((path) => path === node.fullPath).length > 0 ? [] : [node.fullPath];
            });
          }
        }
      }}>
      {props.children}
    </TreeViewSelectionContext.Provider>
  );
};

export const TreeViewSelectionContextConsumer = (props: { children: (selectionService: TreeViewContext<any>) => JSX.Element }): JSX.Element => {
  return (
    <TreeViewSelectionContext.Consumer>
      {(context) => {
        return props.children(context);
      }}
    </TreeViewSelectionContext.Consumer>
  );
};
