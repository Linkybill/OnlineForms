import { dropRight } from "lodash";
import log from "loglevel";
import { useRef, useState } from "react";
import { EditorModel } from "./models/EditorModel";

export interface IHistoryNavigator {
  moveForward: () => EditorModel;
  moveBackward: () => EditorModel;
  addHistoryItem: (editorModel: EditorModel) => void;
  canMoveForward: () => boolean;
  canMoveBackward: () => boolean;
  currentChangeDiffersFromInitial: () => boolean;
  initialize: (editorModel: EditorModel) => void;
}
export const useHistory = (initialEditorModel: EditorModel): IHistoryNavigator => {
  log.debug("using history");
  const [indexState, setIndexState] = useState<number>(0);
  const immediateIndex = useRef(0);
  const stringifiedHistoryItems = useRef<string[]>([JSON.stringify(initialEditorModel)]);
  return {
    initialize: (model: EditorModel): void => {
      stringifiedHistoryItems.current = [JSON.stringify(model)];
    },
    addHistoryItem: (config) => {
      log.debug("history: going to add item", config);
      let historyItemChanged = true;
      // zweite item oder x.tes item kommt hinzu, dann muss das item mit dem vorherigen Item auf change überprüft werden.
      const currentStringifiedConfig = JSON.stringify(config);
      if (currentStringifiedConfig === stringifiedHistoryItems.current[indexState]) {
        historyItemChanged = false;
      }

      log.debug(
        "Editor, history, called addHistoryItem, item differs from last item:",
        historyItemChanged,

        {
          indexState: indexState,
          immediateINdex: immediateIndex.current,
          lastHistoryItem: stringifiedHistoryItems.current[indexState],
          current: currentStringifiedConfig,
          historyItems: stringifiedHistoryItems
        }
      );
      if (historyItemChanged) {
        // vorher wurde rückwärts navigiert und nun kommt ein neues HistoryItem hinzu: In dem Fall müssen alle Changes hinter der aktuellen Position gelöscht werden.
        if (indexState < stringifiedHistoryItems.current.length - 1) {
          log.debug("history, need to clean items: ", stringifiedHistoryItems.current, indexState);

          stringifiedHistoryItems.current = dropRight(stringifiedHistoryItems.current, stringifiedHistoryItems.current.length - 1 - indexState);

          log.debug("history: did clean item", stringifiedHistoryItems.current);
        }

        stringifiedHistoryItems.current.push(JSON.stringify(config));
        setIndexState((oldVal) => oldVal + 1);
        immediateIndex.current += 1;
        log.debug("added history item", {
          stringifiedHistoryItems: stringifiedHistoryItems,
          indexState: indexState
        });
      }
    },
    moveBackward: (): EditorModel => {
      if (immediateIndex.current > 0) {
        immediateIndex.current = immediateIndex.current - 1;
        setIndexState(immediateIndex.current);

        log.debug("history: navigated backward, undo", {
          historyItems: stringifiedHistoryItems,
          indexState: indexState,
          immediateIndex: immediateIndex.current
        });
        const historyToReturn = JSON.parse(stringifiedHistoryItems.current[immediateIndex.current]);

        return historyToReturn;
      }
      throw new Error("can not navigate backward");
    },
    moveForward: (): EditorModel => {
      if (immediateIndex.current < stringifiedHistoryItems.current.length - 1) {
        immediateIndex.current += 1;
        setIndexState(immediateIndex.current);
      }
      log.debug("history, navigated forward, redo", {
        historyItems: stringifiedHistoryItems,
        indexState: indexState,
        immediateIndex: immediateIndex.current
      });
      const modelToReturn: EditorModel = JSON.parse(stringifiedHistoryItems.current[immediateIndex.current]);
      return modelToReturn;
    },
    canMoveBackward: () => {
      log.debug("history, check if can move backward", {
        stateIndex: indexState,
        immediateIndex: immediateIndex.current
      });
      return immediateIndex.current > 0;
    },
    currentChangeDiffersFromInitial: (): boolean => {
      log.debug("history, check for change", {
        indexState: indexState
      });
      if (immediateIndex.current > 0) {
        log.debug("history, check for change", {
          indexState: indexState,
          immediateIndex: immediateIndex.current,
          oldItem: stringifiedHistoryItems.current[0],
          newItem: stringifiedHistoryItems.current[immediateIndex.current]
        });
        return stringifiedHistoryItems.current[0] !== stringifiedHistoryItems.current[immediateIndex.current];
      }
      return false;
    },
    canMoveForward: () => {
      log.debug("history, check if can move forward", {
        stateIndex: indexState,
        immediateIndex: immediateIndex.current
      });
      return immediateIndex.current < stringifiedHistoryItems.current.length - 1;
    }
  };
};
