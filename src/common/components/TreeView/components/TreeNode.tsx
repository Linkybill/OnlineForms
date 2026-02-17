import React, { useEffect, useState } from "react";
import { TreeViewNodeWithFullPath } from "../models/TreeViewNode";
import { ActionButton, IIconProps } from "@fluentui/react";
import { UseTreeViewSelectionContext } from "../context/TreeViewSelectionContext";

export const TreeNode = <T,>(props: TreeViewNodeWithFullPath<T>) => {
  const renderNode = (): JSX.Element => {
    return <span>{props.title}</span>;
  };

  const treeViewContext = UseTreeViewSelectionContext();
  const iconPropsForExpandedIcon: IIconProps =
    props.iconPropsExpanded !== undefined
      ? props.iconPropsExpanded
      : {
          iconName: "ChevronDownSmall"
        };

  useEffect(() => {
    if (treeViewContext.isPathSelected(props.fullPath)) {
      treeViewContext.registerSelectedNode(props);
    }
  });

  const iconPropsForCollapesedIcon: IIconProps =
    props.iconPropsCollapesed !== undefined
      ? props.iconPropsCollapesed
      : {
          iconName: "ChevronRightSmall"
        };
  return (
    <>
      <li style={{ listStyle: "none", minHeight: 20 }}>
        <div style={{ verticalAlign: "center" }}>
          <span key="span1" style={{ float: "left" }}>
            {" "}
            <span className="IconPlaceholder" key="iconCollapseExpandPlaceHolder" style={{ width: 35, display: "flex" }}>
              {props.children !== undefined && props.children.length > 0 ? (
                <ActionButton
                  style={{ height: "auto" }}
                  iconProps={treeViewContext.isPathExpanded(props.fullPath) ? iconPropsForExpandedIcon : iconPropsForCollapesedIcon}
                  onClick={() => {
                    treeViewContext.toggleExpand(props.fullPath);
                  }}
                />
              ) : (
                <>{"\u00A0"} </>
              )}
            </span>
          </span>

          <span key="span2">{props.onRender ? props.onRender(props, renderNode) : renderNode()}</span>
          {props.children !== undefined && props.children !== null && props.children.length > 0 && (
            <ul
              key={"list_" + props.id}
              style={{
                paddingLeft: 15,
                display: treeViewContext.isPathExpanded(props.fullPath) === false ? "none" : undefined
              }}>
              {props.children.map((n, index): JSX.Element => {
                return <TreeNode key={"node_" + index} {...n} onRender={n.onRender} />;
              })}
            </ul>
          )}
        </div>
      </li>
    </>
  );
};
