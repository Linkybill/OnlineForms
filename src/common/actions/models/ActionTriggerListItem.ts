import { ActionTrigger } from "./ActionTrigger";

export interface ActionTriggerListItem {
  expandCollapse: JSX.Element;
  title: string;
  description: string;
  type: string;
  id: string;
  key: string;
  triggeredByFieldName: string;
  data: ActionTrigger;
  isDummyForDropTarget: boolean;
  dataForDropEvents: {
    containerIdWhereItemNeedsToBeInerted: string;
  };
}
