import { FunctionComponent } from "react";
import { ListItem } from "../../../listItem/ListItem";
export interface InjectableComponentProps {
  currentListItem: ListItem;
  onListItemChanged: (listItem: ListItem) => void;
}

export interface IInjectableComponent {
  position: "start" | "end";
  Render: FunctionComponent<InjectableComponentProps>;
}
