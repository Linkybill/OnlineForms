import { useContext, useRef, useState } from "react";
import log from "loglevel";
import { useHistory } from "../components/editor/useHistory";
import * as React from "react";
import { EditorModel } from "../components/editor/models/EditorModel";
import { IEditorInfos } from "./IEditorInfos";
import { FieldDescriptionTypes } from "../listItem/types/FieldDescriptionTypes";
import { sp } from "@pnp/sp";
import { ListNames } from "../../extensions/formTemplateListActions/Constants";
import { FieldTypeNames } from "../listItem/FieldTypeNames";
import { IFieldAddResult } from "@pnp/sp/fields";
import { ChoiceFieldDescription } from "../listItem/fields/choiceField/ChoiceFieldDescription";
import { useComponentContext } from "./CurrentWebPartContext";
import { createEfav2Client } from "../../clients/efav2ClientCreator";
import { AddFormColumnDto, FieldCreationInformation } from "../../clients/efav2Client";
import { Guid } from "@microsoft/sp-core-library";
import { FieldTypeNumbers } from "../../clients/FieldTypes";
import { FieldTypeMapping } from "../../clients/FieldTypeMappings";

const EditorContext = React.createContext<IEditorInfos | undefined>(undefined);

export const useEditorContext = () => useContext(EditorContext);

export const EditorContextProvider: React.FC<{
  editorModel: EditorModel;
  isInEditMode: boolean;
  children?: JSX.Element | JSX.Element[];
}> = (props): JSX.Element => {
  log.debug("rendering editorcontextProvider with props", props);
  const currentUniqueComponentKeys = useRef(props.editorModel.uniqueComponentKeys);
  const [lastUsedCellWidth, setLastUsedCellWidth] = useState(6);
  const history = useHistory(props.editorModel);
  const componentContext = useComponentContext();

  const [editorModel, setEditorModel] = useState<EditorModel>({
    ...props.editorModel,
    fieldTriggers: props.editorModel.fieldTriggers !== undefined ? props.editorModel.fieldTriggers : [],
    saveTriggers: props.editorModel.saveTriggers !== undefined ? props.editorModel.saveTriggers : [],
    startupTriggers: props.editorModel.startupTriggers !== undefined ? props.editorModel.startupTriggers : [],
    ignoreFieldsInItemJSON: props.editorModel.ignoreFieldsInItemJSON !== null && props.editorModel.ignoreFieldsInItemJSON !== undefined ? props.editorModel.ignoreFieldsInItemJSON : [],
    mirroredSPListFields: props.editorModel.mirroredSPListFields !== null && props.editorModel.mirroredSPListFields !== undefined ? props.editorModel.mirroredSPListFields : []
  });
  const [fieldNameBeingEdited, setFieldNameBeingEdited] = useState<string | undefined>(undefined);
  const createFieldInSharePoint = async (toggledField: FieldDescriptionTypes) => {
    const fields = await sp.web.lists.getByTitle(ListNames.aktiveFormsListName).fields.filter(`InternalName eq '${toggledField.internalName}'`).get();
    if (fields.length == 0) {
      let fieldAddResult: IFieldAddResult | undefined = undefined;
      var resolvedWeb = await sp.web.get();
      const commonCreateProps: AddFormColumnDto = new AddFormColumnDto({
        webUrl: resolvedWeb.Url,
        field: new FieldCreationInformation({
          fillInChoice: true,
          displayName: toggledField.displayName,
          group: "angehobene Formularfelder",
          fieldType: FieldTypeNumbers.Invalid,
          id: Guid.newGuid().toString(),
          internalName: toggledField.internalName
        })
      });

      switch (toggledField.type) {
        case FieldTypeNames.Text:
        case FieldTypeNames.Boolean:
        case FieldTypeNames.Choice:
        case FieldTypeNames.MultiChoice: /*{
          const choiceField = toggledField as ChoiceFieldDescription;
          if (choiceField.enableMultipleSelections === true) {
            fieldAddResult = await activeList.fields.addMultiChoice(toggledField.internalName, choiceField.choices, false, commonCreateProps);
          } else {
            fieldAddResult = await activeList.fields.addChoice(toggledField.internalName, choiceField.choices, undefined, false, commonCreateProps);
          }
          break;
        }*/
        case FieldTypeNames.Currency:

        case FieldTypeNames.DateTime: /*{
          var dateTimeField = toggledField as DateTimeFieldDescription;
          fieldAddResult = await activeList.fields.addDateTime(
            toggledField.internalName,
            dateTimeField.displayMode === 0 ? DateTimeFieldFormatType.DateOnly : DateTimeFieldFormatType.DateTime,
            undefined,
            undefined,
            commonCreateProps
          );
          break;
        }*/

        case FieldTypeNames.Note:

        case FieldTypeNames.Number:

        case FieldTypeNames.URL:
        case FieldTypeNames.User:
        case FieldTypeNames.UserMulti: {
          /*await efaClient.addFormColumn(
            new AddFormColumnDto({
              webUrl: resolvedWeb.Url,
              field:{
                id: Guid.newGuid().toString(),
                group:"angehobene Felder",
                displayName:toggledField.displayName,
                internalName: toggledField.internalName,
                fieldType: FieldType._12
              }
            })
          );
          break;*/
          commonCreateProps.field.fieldType = FieldTypeMapping[toggledField.type];

          break;
        }
        default: {
          log.error("Field is not supported for adding in SharePoint");
        }
      }
      if (toggledField.type === FieldTypeNames.Choice || toggledField.type === FieldTypeNames.MultiChoice) {
        var choiceFieldDef = toggledField as ChoiceFieldDescription;
        if (choiceFieldDef.choices.length > 0) {
          commonCreateProps.field.choices = choiceFieldDef.choices;
          commonCreateProps.field.fillInChoice = true;
          commonCreateProps.field.format = "Dropdown";
          commonCreateProps.field.fieldType = choiceFieldDef.enableMultipleSelections === true ? FieldTypeNumbers.MultiChoice : FieldTypeNumbers.Choice;
        } else {
          commonCreateProps.field.fieldType = FieldTypeNumbers.Invalid;
        }
      }
      if ((commonCreateProps.field.fieldType as number) != FieldTypeNumbers.Invalid) {
        var efaClient = await createEfav2Client("");
        await efaClient.addFormColumn(commonCreateProps);
      }
      if (fieldAddResult !== undefined) {
        //await sp.web.fields.createFieldAsXml(res.data.SchemaXml);
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
