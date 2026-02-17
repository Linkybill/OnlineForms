import { ComponentConfig } from "../components/componentProxy/models/componentConfig";
import { EditorModel } from "../components/editor/models/EditorModel";
import { IHistoryNavigator } from "../components/editor/useHistory";

export interface IEditorInfos {
  isInEditMode: boolean;
  historyNavigator: IHistoryNavigator;
  currentUniqueKeys: string[];
  setLastUsedCellWidth: (width: number) => void;
  getLastUsedCellWidth: () => number;
  addUniqueComponentKey: (key: string) => void;
  setUniqueComponentKeys: (keys: string[]) => void;
  removeUniqueComponentKeysWhichArePartOfConig: (config: ComponentConfig) => void;
  removeAllUniqueComponentKeys: () => void;
  initialize: (model: EditorModel) => void;
  editorModel: () => EditorModel;
  setContainerHiddenWhenCondition: (containerId: string, condition: string | undefined) => void;
  setContainerFieldsAreLockedCondition: (containerId: string, condition: string | undefined) => void;
  getContainerHiddenWhenConditions: () => { [key: string]: string };
  getContainerFieldsAreLockedConditions: () => { [key: string]: string };
  setEditorModel: (model: EditorModel) => void;
  openFieldEditPanel: (fieldName: string) => void;
  closeFieldEditPanel: () => void;
  getFieldNameBeingEdited: () => string | undefined;
  fieldShouldGetSavedInItemJSON: (fieldName: string) => boolean;
  toggleFieldShouldGetSavedFromItemJSON: (fieldName: string) => void;
  fieldIsMirrored: (fieldName: string) => boolean;
  toggleMirroredField: (fieldName: string) => void;
}
