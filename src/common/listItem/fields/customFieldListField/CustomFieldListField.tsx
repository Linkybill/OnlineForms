import log from "loglevel";
import { IFieldComponentProps } from "../base/FieldComponentProps";
import { CustomFieldListFieldDescription } from "./CustomFieldListFieldDescription";
import * as React from "react";
import { FieldDescriptionTypes } from "../../types/FieldDescriptionTypes";
import { CustomFieldList } from "../../../components/editor/components/fieldEditor/CustomFieldList";
import { ListItemContextConsumer, ListItemContextProvider, useListItemContext } from "../../../helper/ListItemContext";
import { createDefaultItem } from "../../helper/ListHelper";
import { ParameterPickerContextProvider } from "../../../helper/parameterPickerContext/ParameterPickerContext";
import { useEditorContext } from "../../../helper/EditorContext";

export interface ICustomFieldListProps extends IFieldComponentProps<CustomFieldListFieldDescription, FieldDescriptionTypes[]> {}

export const CustomFieldListField = (props: ICustomFieldListProps): JSX.Element => {
  const listitemContext = useListItemContext();
  const defaultItemForEditorPurpose = createDefaultItem(props.fieldValue, "", []);
  const editorContext = useEditorContext();
  return (
    <>
      <ListItemContextProvider
        listItem={defaultItemForEditorPurpose}
        listItemHasConflictingChanges={() => false}
        onFormClose={() => {}}
        onListItemSave={() => {
          return defaultItemForEditorPurpose;
        }}
        registeredContainerHiddenWhenConditions={{}}
        registeredContainerLockedConditions={{}}>
        <ListItemContextConsumer>
          {(itemAccessor) => {
            return (
              <>
                <ParameterPickerContextProvider listItemContextForParameterPicker={itemAccessor} editorModelForParameterPicker={editorContext.editorModel()}>
                  <CustomFieldList
                    fieldTriggers={[]}
                    onTriggerListUpdated={() => {}}
                    fields={props.fieldValue}
                    onFieldListUpdated={(fields) => {
                      const newListItem = createDefaultItem(fields, "", []);
                      listitemContext.replaceListItemAndTriggerConditions(newListItem);
                      props.onValueChanged(props.fieldDescription, fields);
                    }}></CustomFieldList>
                </ParameterPickerContextProvider>
              </>
            );
          }}
        </ListItemContextConsumer>
      </ListItemContextProvider>
    </>
  );
};
