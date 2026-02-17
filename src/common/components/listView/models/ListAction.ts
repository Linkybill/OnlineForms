export interface ListAction {
  isActive: (selectedItemIds: number[]) => boolean;
  title: string;
  category: string;
  onActionClicked: (selectedItemIds: number[]) => void | Promise<void>;
}
