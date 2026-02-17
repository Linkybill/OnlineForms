import { useContext, useRef } from "react";
import * as React from "react";
import { ListItem } from "../../listItem/ListItem";
import { EditorModel } from "../../components/editor/models/EditorModel";
import log from "loglevel";
import { IListItemAccessor } from "../ListItemContext";

// todo: Seperate context into ListItemContext, ParameterContext and ConditionContext, where COnditionContext has access to ListItemContext and ParameterContext
export interface IParameterPickerContext {
  listItemContextForParameterPicker: IListItemAccessor;
  editorModel: EditorModel;
}

export interface IParameterPickerContextProviderProps {
  listItemContextForParameterPicker: IListItemAccessor;
  editorModelForParameterPicker: EditorModel;
  children?: JSX.Element | JSX.Element[];
}

const ParameterPickerContext = React.createContext<IParameterPickerContext | undefined>({
  listItemContextForParameterPicker: undefined,
  editorModel: undefined
});

export const useParameterPickerContext = () => useContext(ParameterPickerContext);

export const ParameterPickerContextProvider: React.FC<IParameterPickerContextProviderProps> = (props): JSX.Element => {
  const contextValue = React.useMemo(
    () => ({
      listItemContextForParameterPicker: props.listItemContextForParameterPicker,
      editorModel: props.editorModelForParameterPicker
    }),
    [props.listItemContextForParameterPicker]
  );
  log.debug("rendering parameterPickerContextProvider", props);
  return <ParameterPickerContext.Provider value={contextValue}>{props.children}</ParameterPickerContext.Provider>;
};
