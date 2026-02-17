import { IIconProps, IRenderFunction } from "@fluentui/react";

interface TreeViewNodeBase<TData> {
  title: string;
  isLeaf: boolean;
  id: string;
  nameInPath: string;
  data: TData;
  iconPropsExpanded?: IIconProps;
  iconPropsCollapesed?: IIconProps;
  onRender?: IRenderFunction<TreeViewNodeWithFullPath<TData>>;
}

export interface TreeViewNode<TData> extends TreeViewNodeBase<TData> {
  children?: TreeViewNode<TData>[];
}

export interface TreeViewNodeWithFullPath<TData> extends TreeViewNodeBase<TData> {
  fullPath: string;
  children?: TreeViewNodeWithFullPath<TData>[];
}
