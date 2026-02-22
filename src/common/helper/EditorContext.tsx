import { useContext, useRef, useState } from "react";
import log from "loglevel";
import { useHistory } from "../components/editor/useHistory";
import * as React from "react";
import { EditorModel } from "../components/editor/models/EditorModel";
import { IEditorInfos } from "./IEditorInfos";
import { FieldDescriptionTypes } from "../listItem/types/FieldDescriptionTypes";
import { sp } from "@pnp/sp";
import { FieldTypeNames } from "../listItem/FieldTypeNames";
import { ChoiceFieldDescription } from "../listItem/fields/choiceField/ChoiceFieldDescription";
import { useComponentContext } from "./CurrentWebPartContext";
import { ChoiceFieldFormatType, DateTimeFieldFormatType, FieldUserSelectionMode, UrlFieldFormatType } from "@pnp/sp/fields";
import { FormContentService } from "../services/FormContentService";
import { LookupFieldDescription } from "../listItem/fields/lookupField/LookupFieldDescription";
import { UserFieldDescription } from "../listItem/fields/userField/UserFieldDescription";
import { NumberFieldDescription } from "../listItem/fields/numberField/NumberFieldDescription";
import { CurrencyFieldDescription } from "../listItem/fields/currencyField/CurrencyFieldDescription";
import { DateTimeDisplayMode, DateTimeFieldDescription } from "../listItem/fields/dateTimeField/DateTimeFieldDescription";
import { UrlFieldDescription } from "../listItem/fields/urlField/UrlFieldDescription";

const EditorContext = React.createContext<IEditorInfos | undefined>(undefined);

export const useEditorContext = () => useContext(EditorContext);

export const EditorContextProvider: React.FC<{
  editorModel: EditorModel;
  isInEditMode: boolean;
  instanceListName?: string;
  templateVersionIdentifier?: string;
  children?: JSX.Element | JSX.Element[];
}> = (props): JSX.Element => {
  log.debug("rendering editorcontextProvider with props", props);
  const currentUniqueComponentKeys = useRef(props.editorModel.uniqueComponentKeys);
  const [lastUsedCellWidth, setLastUsedCellWidth] = useState(6);
  const history = useHistory(props.editorModel);
  const componentContext = useComponentContext();
  const instanceListNameRef = useRef<string | undefined>(props.instanceListName);

  const [editorModel, setEditorModel] = useState<EditorModel>({
    ...props.editorModel,
    fieldTriggers: props.editorModel.fieldTriggers !== undefined ? props.editorModel.fieldTriggers : [],
    saveTriggers: props.editorModel.saveTriggers !== undefined ? props.editorModel.saveTriggers : [],
    startupTriggers: props.editorModel.startupTriggers !== undefined ? props.editorModel.startupTriggers : [],
    ignoreFieldsInItemJSON: props.editorModel.ignoreFieldsInItemJSON !== null && props.editorModel.ignoreFieldsInItemJSON !== undefined ? props.editorModel.ignoreFieldsInItemJSON : [],
    mirroredSPListFields: props.editorModel.mirroredSPListFields !== null && props.editorModel.mirroredSPListFields !== undefined ? props.editorModel.mirroredSPListFields : []
  });
  const [fieldNameBeingEdited, setFieldNameBeingEdited] = useState<string | undefined>(undefined);
  const resolveInstanceListName = async (): Promise<string | undefined> => {
    if (instanceListNameRef.current) {
      return instanceListNameRef.current;
    }
    if (props.templateVersionIdentifier) {
      try {
        const service = new FormContentService();
        instanceListNameRef.current = await service.resolveInstanceListNameByTemplateIdentifier(props.templateVersionIdentifier);
      } catch (e) {
        log.warn("could not resolve instance list name", e);
      }
    }
    return instanceListNameRef.current;
  };
  const createFieldInSharePoint = async (toggledField: FieldDescriptionTypes) => {
    const listName = await resolveInstanceListName();
    if (!listName) {
      log.warn("skipping field creation: instance list name not resolved");
      return;
    }
    const fields = await sp.web.lists.getByTitle(listName).fields.filter(`InternalName eq '${toggledField.internalName}'`).get();
    if (fields.length == 0) {
      const list = sp.web.lists.getByTitle(listName);
      const baseProperties = {
        Group: "angehobene Formularfelder",
        Description: toggledField.description ?? "",
        Required: toggledField.required === true
      };
      switch (toggledField.type) {
        case FieldTypeNames.Text: {
          await list.fields.addText(toggledField.internalName, undefined, baseProperties);
          break;
        }
        case FieldTypeNames.Note: {
          await list.fields.addMultilineText(toggledField.internalName, undefined, true, false, false, true, baseProperties);
          break;
        }
        case FieldTypeNames.Boolean: {
          await list.fields.addBoolean(toggledField.internalName, baseProperties);
          break;
        }
        case FieldTypeNames.Number: {
          const numberField = toggledField as NumberFieldDescription;
          await list.fields.addNumber(toggledField.internalName, undefined, undefined, baseProperties);
          if (numberField.numberOfDecimals !== undefined) {
            await list.fields.getByInternalNameOrTitle(toggledField.internalName).update({ Decimals: numberField.numberOfDecimals });
          }
          break;
        }
        case FieldTypeNames.Currency: {
          const currencyField = toggledField as CurrencyFieldDescription;
          await list.fields.addCurrency(toggledField.internalName, undefined, undefined, currencyField.currencyLocaleId, baseProperties);
          if (currencyField.numberOfDecimals !== undefined) {
            await list.fields.getByInternalNameOrTitle(toggledField.internalName).update({ Decimals: currencyField.numberOfDecimals });
          }
          break;
        }
        case FieldTypeNames.DateTime: {
          const dateField = toggledField as DateTimeFieldDescription;
          const format = dateField.displayMode === DateTimeDisplayMode.DateAndTime ? DateTimeFieldFormatType.DateTime : DateTimeFieldFormatType.DateOnly;
          await list.fields.addDateTime(toggledField.internalName, format, undefined, undefined, baseProperties);
          break;
        }
        case FieldTypeNames.Choice: {
          const choiceField = toggledField as ChoiceFieldDescription;
          const format = choiceField.representation === "Checkbox / Radio" ? ChoiceFieldFormatType.RadioButtons : ChoiceFieldFormatType.Dropdown;
          await list.fields.addChoice(toggledField.internalName, choiceField.choices ?? [], format, choiceField.fillInChoiceEnabled === true, baseProperties);
          break;
        }
        case FieldTypeNames.MultiChoice: {
          const choiceField = toggledField as ChoiceFieldDescription;
          await list.fields.addMultiChoice(toggledField.internalName, choiceField.choices ?? [], choiceField.fillInChoiceEnabled === true, baseProperties);
          break;
        }
        case FieldTypeNames.URL: {
          const urlField = toggledField as UrlFieldDescription;
          const format = urlField.isImageUrl === true ? UrlFieldFormatType.Image : UrlFieldFormatType.Hyperlink;
          await list.fields.addUrl(toggledField.internalName, format, baseProperties);
          break;
        }
        case FieldTypeNames.User:
        case FieldTypeNames.UserMulti: {
          const userField = toggledField as UserFieldDescription;
          const mode = userField.allowGroupSelection === true ? FieldUserSelectionMode.PeopleAndGroups : FieldUserSelectionMode.PeopleOnly;
          await list.fields.addUser(toggledField.internalName, mode, baseProperties);
          if (userField.canSelectMultipleItems === true || toggledField.type === FieldTypeNames.UserMulti) {
            await list.fields.getByInternalNameOrTitle(toggledField.internalName).update({ AllowMultipleValues: true });
          }
          if (userField.groupId !== undefined) {
            await list.fields.getByInternalNameOrTitle(toggledField.internalName).update({ SelectionGroup: userField.groupId });
          }
          break;
        }
        case FieldTypeNames.Lookup:
        case FieldTypeNames.LookupMulti: {
          const lookupField = toggledField as LookupFieldDescription;
          await list.fields.addLookup(toggledField.internalName, lookupField.lookupListId, lookupField.lookupField, baseProperties);
          if (lookupField.canSelectMultipleItems === true || toggledField.type === FieldTypeNames.LookupMulti) {
            await list.fields.getByInternalNameOrTitle(toggledField.internalName).update({ AllowMultipleValues: true });
          }
          break;
        }
        default: {
          log.warn("Field is not supported for auto-creation in SharePoint", toggledField.type);
        }
      }
      if (toggledField.displayName && toggledField.displayName !== toggledField.internalName) {
        await list.fields.getByInternalNameOrTitle(toggledField.internalName).update({ Title: toggledField.displayName });
      }
    }
  };

  return (
    <EditorContext.Provider
      value={{
        toggleMirroredField: (fieldName: string): void => {
          const fieldIsMirrored = editorModel.mirroredSPListFields.indexOf(fieldName) > -1;
          var toggledField = editorModel.customFieldDefinitions.filter((field) => field.internalName === fieldName)[0];
          if (fieldIsMirrored === false) {
            createFieldInSharePoint(toggledField)
              .then(() => {
                log.debug("Feld wurde erstellt");
              })
              .catch((e) => {
                log.error("Feld konnte nicht erstellt werden im SharePoint", fieldName, e);
              });
          }
          setEditorModel((old) => {
            const newModel: EditorModel = { ...old, mirroredSPListFields: fieldIsMirrored ? old.mirroredSPListFields.filter((mirroredField) => mirroredField !== fieldName) : [...old.mirroredSPListFields, fieldName] };
            history.addHistoryItem(newModel);
            return newModel;
          });
        },
        fieldIsMirrored: (fieldName: string): boolean => {
          return editorModel.mirroredSPListFields.indexOf(fieldName) > -1;
        },

        fieldShouldGetSavedInItemJSON: (fieldName: string): boolean => {
          return editorModel.ignoreFieldsInItemJSON.indexOf(fieldName) === -1;
        },
        toggleFieldShouldGetSavedFromItemJSON: (fieldName: string): void => {
          const fieldShouldGetSaved = editorModel.ignoreFieldsInItemJSON.indexOf(fieldName) === -1;
          setEditorModel((old) => {
            const newModel = {
              ...old,
              ignoreFieldsInItemJSON: fieldShouldGetSaved === true ? [...old.ignoreFieldsInItemJSON, fieldName] : old.ignoreFieldsInItemJSON.filter((name) => fieldName !== name)
            };
            history.addHistoryItem(newModel);
            return newModel;
          });
        },
        getFieldNameBeingEdited: () => fieldNameBeingEdited,
        closeFieldEditPanel: () => {
          setFieldNameBeingEdited(undefined);
        },
        openFieldEditPanel: (fieldName: string): void => {
          setFieldNameBeingEdited(fieldName);
        },
        setEditorModel: (model): void => {
          history.addHistoryItem(model);
          setEditorModel(model);
        },
        setContainerHiddenWhenCondition: (containerId: string, condition: string | undefined): void => {
          setEditorModel((old) => {
            const newConditions = { ...old.containerHiddenWhenConditions };
            newConditions[containerId] = condition;
            return { ...old, containerHiddenWhenConditions: newConditions };
          });
        },
        getContainerHiddenWhenConditions: () => {
          log.debug("ContainerHiddenWhenConditions from editorContext", editorModel.containerHiddenWhenConditions);
          if (editorModel.containerHiddenWhenConditions !== undefined) {
            return editorModel.containerHiddenWhenConditions;
          }
          return {};
        },
        setContainerFieldsAreLockedCondition: (containerId: string, condition: string | undefined): void => {
          setEditorModel((old) => {
            const newConditions = { ...old.containerFieldsAreLockedConditions };
            newConditions[containerId] = condition;
            return { ...old, containerFieldsAreLockedConditions: newConditions };
          });
        },
        getContainerFieldsAreLockedConditions: () => {
          if (editorModel.containerFieldsAreLockedConditions === undefined) {
            return {};
          }
          return editorModel.containerFieldsAreLockedConditions;
        },
        editorModel: (): EditorModel => {
          return editorModel;
        },
        historyNavigator: history,
        setUniqueComponentKeys: (keys: string[]): void => {
          currentUniqueComponentKeys.current = [...keys];
        },
        removeAllUniqueComponentKeys: () => {
          currentUniqueComponentKeys.current = [];
        },
        currentUniqueKeys: currentUniqueComponentKeys.current,
        addUniqueComponentKey: (key: string) => {
          log.debug("EditorContext, history, adding unique key", key, currentUniqueComponentKeys.current);
          if (currentUniqueComponentKeys.current.indexOf(key) === -1) {
            currentUniqueComponentKeys.current.push(key);
          }
        },
        isInEditMode: props.isInEditMode,
        setLastUsedCellWidth: setLastUsedCellWidth,
        getLastUsedCellWidth: () => lastUsedCellWidth,
        removeUniqueComponentKeysWhichArePartOfConig: (config): void => {
          const removedComponentString = JSON.stringify(config);
          const deletedKeys = currentUniqueComponentKeys.current.filter((uniqueKey) => {
            if (removedComponentString.indexOf(uniqueKey) >= 0) {
              return false;
            }
            return true;
          });

          currentUniqueComponentKeys.current = [...deletedKeys];
        },
        initialize: (editorModel: EditorModel) => {
          history.initialize(editorModel);
          currentUniqueComponentKeys.current = editorModel.uniqueComponentKeys;
        }
      }}>
      {props.children}
    </EditorContext.Provider>
  );
};

export const EditorContextConsumer: React.FC<{
  children: (infos: IEditorInfos) => JSX.Element;
}> = (props): JSX.Element => {
  return <EditorContext.Consumer>{(info) => <>{props.children(info as IEditorInfos)}</>}</EditorContext.Consumer>;
};
