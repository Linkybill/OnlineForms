import { ListItem } from "../listItem/ListItem";
import { FileWithKey } from "./FormFileContext";

export interface IListItemContextProviderProps {
  listItem: ListItem;
  shouldUpdateListItemInUseEffect?: boolean;
  listItemHasConflictingChanges?: () => boolean | Promise<boolean>;
  onListItemSave: (currentItem: ListItem, filesToUpload: FileWithKey[], filenamesToDelete: string[], fileName?: string) => ListItem | Promise<ListItem>;
  ignoreStartupTriggers?: boolean;
  onFormClose: () => void;
  reExecuteStartupTriggersNumber?: number;
  registeredContainerHiddenWhenConditions: { [key: string]: string };
  registeredContainerLockedConditions: { [key: string]: string };
  children?: JSX.Element | JSX.Element[] | string;
  shouldShowHelpTextsOnFields?: boolean;
}
