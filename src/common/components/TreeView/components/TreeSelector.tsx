import React, { memo } from "react";
import { TreeViewNodeWithFullPath } from "../models/TreeViewNode";
import { ActionButton, Checkbox } from "@fluentui/react";
import { TreeViewContext, TreeViewSelectionContextConsumer, TreeViewSelectionContextProvider, UseTreeViewSelectionContext } from "../context/TreeViewSelectionContext";
import { SelectionMode } from "../models/SelectionMode";
import log from "loglevel";
import { TreeViewWithFullPath, TreeViewWithFullPathProps } from "./TreeViewWithFullPath";

export const TreeSelector = memo(
  <TNodeData,>(
    props: TreeViewWithFullPathProps<TNodeData> & {
      selectionMode: SelectionMode;
      selectedNodePahs?: string[];
      onCancelClicked?: () => void;
      approveButtonText?: string;
      onSelectionApproved?: (selectedNodes: TreeViewNodeWithFullPath<TNodeData>[]) => void;
      onSelectionChanged?: (selectedNodes: TreeViewNodeWithFullPath<TNodeData>[]) => void;
    }
  ): JSX.Element => {
    const onRenderWithCheckbox = (node: TreeViewNodeWithFullPath<TNodeData>, defaultRender: (node: TreeViewNodeWithFullPath<TNodeData>) => JSX.Element) => {
      const selectionContext = UseTreeViewSelectionContext(); // can use hook here becaue this is a render function which is seen as a component. and from components point of view this is not within a loop or something.
      return (
        <>
          <span style={{ float: "left" }}>
            <Checkbox
              checked={selectionContext.isPathSelected(node.fullPath)}
              onChange={(element, checked) => {
                selectionContext.toggleSelect(node);
                if (props.onSelectionChanged !== undefined) {
                  props.onSelectionChanged(selectionContext.getSelectedNodes() as TreeViewNodeWithFullPath<TNodeData>[]);
                }
              }}
              styles={{
                checkbox: {
                  height: 15,
                  width: 15,
                  position: "relative",
                  top: 4
                }
              }}></Checkbox>
          </span>
          {defaultRender(node)}
        </>
      );
    };
    const mapNodeToNodesWithCustomRender = (node: TreeViewNodeWithFullPath<TNodeData>): TreeViewNodeWithFullPath<TNodeData> => {
      log.debug("map nodes of treeselector called");
      const nodeToReturn: TreeViewNodeWithFullPath<TNodeData> = {
        ...node,
        onRender: (nodeData, render): JSX.Element => {
          if (node.onRender !== undefined) {
            return (
              <>
                {onRenderWithCheckbox(node, render)} {node.onRender(nodeData)}
              </>
            );
          }
          return onRenderWithCheckbox(node, render);
        },
        children:
          node.children !== undefined
            ? node.children.map((nodeToMap): TreeViewNodeWithFullPath<TNodeData> => {
                return mapNodeToNodesWithCustomRender(nodeToMap);
              })
            : []
      };
      return nodeToReturn;
    };

    return (
      <>
        <TreeViewSelectionContextProvider expandedPaths={props.expandedNodePaths} allNodes={props.nodesWithPath} selectedPaths={props.selectedNodePahs} selectionMode={props.selectionMode}>
          <TreeViewSelectionContextConsumer>
            {(selectionContext: TreeViewContext<TNodeData>): JSX.Element => {
              return (
                <>
                  <TreeViewWithFullPath
                    expandedNodePaths={props.expandedNodePaths}
                    nodesWithPath={props.nodesWithPath.map((node): TreeViewNodeWithFullPath<TNodeData> => {
                      return mapNodeToNodesWithCustomRender(node);
                    })}></TreeViewWithFullPath>
                  {props.onSelectionApproved !== undefined && (
                    <ActionButton
                      text={props.approveButtonText ? props.approveButtonText : "Übernehmen"}
                      onClick={() => {
                        props.onSelectionApproved(selectionContext.getSelectedNodes());
                      }}></ActionButton>
                  )}
                </>
              );
            }}
          </TreeViewSelectionContextConsumer>
        </TreeViewSelectionContextProvider>
      </>
    );
  },
  (oldProps, newProps) => {
    let oldPaths = oldProps.expandedNodePaths;
    let newPaths = newProps.expandedNodePaths;

    if (oldPaths !== null && newPaths !== null && oldPaths !== undefined && newPaths !== undefined) {
      const oldPathsString = oldPaths.join("|");
      const newPathsString = newPaths.join("|");
      return newPathsString === oldPathsString;
    }
    return false;
  }
);
