import { useEffect, useState } from "react";
import log from "loglevel";
import { IFieldComponentProps } from "../base/FieldComponentProps";
import { ListFieldDescription } from "./ListFieldDescription";
import { FieldDescriptionTypes } from "../../types/FieldDescriptionTypes";
import { ListItem } from "../../ListItem";
import { createDefaultItem } from "../../helper/ListHelper";
import { mapListItemToObject } from "../../mapper/ListItemToObjectMapper";
import * as React from "react";
import { ModalWithCloseButton } from "../../../components/modals/ModalWithCloseButton";
import { GenericList } from "../../../components/formcomponents/components/genericList/GenericList";
import { ListItemContextConsumer, ListItemContextProvider, useListItemContext } from "../../../helper/ListItemContext";
import { CrudCommandbar } from "../../../components/crudCommandbar/CurdCommandbar";
import { WithErrorsBottom } from "../../../components/errorComponent/WithErrorsBottom";
import { LabelWithRequiredInfo } from "../../labelWithRequiredInfo";
import { EditorContextConsumer, EditorContextProvider } from "../../../helper/EditorContext";
import { EditorModel } from "../../../components/editor/models/EditorModel";
import { TemplatedForm } from "../../../components/formcomponents/components/templatedForm/TemplatedForm";
import { createFormTemplateBasedOnFields } from "../../../helper/FormTemplateGenerator";
import { ActionButton, DefaultButton } from "@fluentui/react";
import { FieldTypeNames } from "../../FieldTypeNames";
import { DateTimeValue } from "../dateTimeField/DateTimeValue";
import { UserFieldValue } from "../valueTypes/UserFieldValue";
import { Guid } from "@microsoft/sp-core-library";

export interface IListFieldProps extends IFieldComponentProps<ListFieldDescription, any[]> {
  showCommandbar?: boolean;
}

export const ListField = (props: IListFieldProps): JSX.Element => {
  const shouldShowCommandbar = props.showCommandbar === true;
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const templateToUse: EditorModel = props.fieldDescription.editorModel !== undefined ? props.fieldDescription.editorModel : createFormTemplateBasedOnFields(props.fieldDescription.itemProperties);

  var templateToUseForPrintView: EditorModel =
    props.fieldDescription.editorModel !== undefined ? props.fieldDescription.editorModel : createFormTemplateBasedOnFields(props.fieldDescription.itemProperties, JSON.stringify({ "==": [1, 1] }));
  const propsToUseForListItem = templateToUse.customFieldDefinitions;

  props.fieldDescription.itemProperties.forEach((itemProp) => {
    if (propsToUseForListItem.filter((p) => p.internalName === itemProp.internalName).length === 0) {
      propsToUseForListItem.push(itemProp);
    }
  });
  const initialItemBeingAdded = createDefaultItem(propsToUseForListItem, "", []);
  initialItemBeingAdded.ID = props.fieldValue.length;
  initialItemBeingAdded.Guid = Guid.newGuid().toString();
  const [itemBeingAdded, setItemBeingAdded] = useState<ListItem>(initialItemBeingAdded);
  const [itemBeingEdited, setItemBeingEdited] = useState<ListItem>(createDefaultItem(propsToUseForListItem, "", []));
  const [selectedItemGuids, setSelectedItemGuids] = useState<string[]>([]);

  const listItemContext = useListItemContext();
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<"ascending" | "descending">("ascending");

  let fieldValue = props.fieldValue !== undefined ? props.fieldValue : [];

  if (sortField !== undefined) {
    fieldValue = fieldValue.sort((a, b) => {
      let valAToCompare = a[sortField];
      let valBToCompare = b[sortField];
      const fieldType = props.fieldDescription.itemProperties.filter((p) => p.internalName === sortField)[0].type;

      if (fieldType === FieldTypeNames.DateTime) {
        if (valAToCompare !== undefined && valAToCompare !== null) {
          valAToCompare = (valAToCompare as DateTimeValue).time;
        }
        if (valBToCompare !== undefined && valBToCompare !== null) {
          valBToCompare = (valBToCompare as DateTimeValue).time;
        }
      }
      if (fieldType === FieldTypeNames.User) {
        if (valAToCompare !== undefined && valAToCompare !== null && valAToCompare.length > 0) {
          valAToCompare = (valAToCompare as UserFieldValue[])[0].title;
        }
        if (valBToCompare !== undefined && valBToCompare !== null && valBToCompare.length > 0) {
          valBToCompare = (valBToCompare as UserFieldValue[])[0].title;
        }
      }
      if (valAToCompare < valBToCompare) {
        return sortDirection === "ascending" ? -1 : 1;
      }
      if (valAToCompare > valBToCompare) {
        return sortDirection === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }

  log.debug("rendering listfield name " + props.fieldDescription.internalName + " with properties", {
    props: props,
    disabled: !props.editMode
  });

  useEffect(() => {
    if (selectedItemGuids.length !== 0) {
      const items = mapObjectsToListItems(fieldValue, propsToUseForListItem);

      const selectedItem = items.filter((i) => i.Guid == selectedItemGuids[0])[0];
      setItemBeingEdited(selectedItem);
    }
  }, [selectedItemGuids]);

  const newItemLabelText = props.fieldDescription.newItemLabel !== undefined && props.fieldDescription.newItemLabel !== "" ? props.fieldDescription.newItemLabel : "Neues Element hinzufügen";

  const onAddClicked = () => {
    setShowAddForm(true);
  };

  const listHasValues = props.fieldValue !== undefined && props.fieldValue !== null && props.fieldValue.length > 0;

  const renderAddButton = (): JSX.Element => {
    return (
      <>
        {props.editMode === true && (
          <>
            <ActionButton
              className="iconButton listMenuAddButton"
              iconProps={{ iconName: "Add" }}
              text={newItemLabelText}
              onClick={() => {
                onAddClicked();
              }}
            />
          </>
        )}
      </>
    );
  };
  const mapObjectsToListItems = (values: any[], fields: FieldDescriptionTypes[]): ListItem[] => {
    return values.map((value, index): ListItem => {
      const item = new ListItem(value.ID);
      item.Guid = value.Guid;
      fields.forEach((field) => {
        item.addProperty({
          description: field,
          value: value[field.internalName],
          rawSharePointData: value[field.internalName],
          validationErrors: []
        });
      });

      return item;
    });
  };

  const mappedListItems = mapObjectsToListItems(fieldValue, props.fieldDescription.itemProperties);

  return (
    <>
      <WithErrorsBottom errors={props.validationErrors}>
        {props.editMode === true && (
          <>
            {showAddForm === true && (
              <>
                <ModalWithCloseButton
                  styles={{
                    main: {
                      minWidth: "40%",
                      minHeight: "40%"
                    }
                  }}
                  title={props.fieldDescription.displayName + " hinzufügen"}
                  isOpen={true}
                  onClose={() => {
                    setShowAddForm(false);
                  }}>
                  <EditorContextProvider editorModel={templateToUse} isInEditMode={false}>
                    <EditorContextConsumer>
                      {(editorContext) => {
                        return (
                          <>
                            <ListItemContextProvider
                              onFormClose={() => {
                                setShowAddForm(false);
                              }}
                              registeredContainerLockedConditions={templateToUse.containerFieldsAreLockedConditions}
                              registeredContainerHiddenWhenConditions={templateToUse.containerHiddenWhenConditions}
                              onListItemSave={(listItem: ListItem): ListItem => {
                                const newObject = mapListItemToObject(listItem);

                                const resettedItem = createDefaultItem(propsToUseForListItem, "", []);
                                resettedItem.Guid = Guid.newGuid().toString();
                                resettedItem.ID = props.fieldValue.length + 1;
                                setItemBeingAdded(resettedItem);
                                setShowAddForm(false);
                                props.onValueChanged(props.fieldDescription, [...fieldValue, newObject]);
                                return listItem;
                              }}
                              listItem={itemBeingAdded}>
                              <ListItemContextConsumer>
                                {(listItemContextAccessor) => {
                                  return (
                                    <>
                                      <div style={{}}>
                                        <TemplatedForm editMode={true} injectableComponents={[]} template={templateToUse.componentConfig}></TemplatedForm>
                                      </div>
                                    </>
                                  );
                                }}
                              </ListItemContextConsumer>
                            </ListItemContextProvider>
                          </>
                        );
                      }}
                    </EditorContextConsumer>
                  </EditorContextProvider>
                </ModalWithCloseButton>
              </>
            )}

            {showEditForm === true && (
              <ModalWithCloseButton
                styles={{
                  main: {
                    minWidth: "40%",
                    minHeight: "40%"
                  }
                }}
                title={props.fieldDescription.displayName + " bearbeiten"}
                isOpen={showEditForm === true}
                onClose={() => {
                  setShowEditForm(false);
                }}>
                <EditorContextProvider editorModel={templateToUse} isInEditMode={false}>
                  <ListItemContextProvider
                    onFormClose={() => {
                      setShowEditForm(false);
                    }}
                    registeredContainerLockedConditions={templateToUse.containerFieldsAreLockedConditions}
                    registeredContainerHiddenWhenConditions={templateToUse.containerHiddenWhenConditions}
                    onListItemSave={(listItem: ListItem): ListItem => {
                      const newObject = mapListItemToObject(listItem);
                      const itemIndex = fieldValue.findIndex((item) => item.Guid === selectedItemGuids[0]);
                      if (itemIndex > -1) {
                        fieldValue[itemIndex] = newObject;
                      }
                      // indexof()

                      setShowEditForm(false);
                      props.onValueChanged(props.fieldDescription, fieldValue);

                      return listItem;
                    }}
                    listItem={itemBeingEdited}>
                    <>
                      <div style={{}}>
                        <TemplatedForm editMode={true} injectableComponents={[]} template={templateToUse.componentConfig}></TemplatedForm>
                      </div>
                    </>
                  </ListItemContextProvider>
                </EditorContextProvider>
              </ModalWithCloseButton>
            )}
          </>
        )}

        <LabelWithRequiredInfo text={props.fieldDescription.displayName} required={props.fieldDescription.required}></LabelWithRequiredInfo>
        <div className="inScreenOnly">
          {props.editMode === true && shouldShowCommandbar === true && (
            <>
              <CrudCommandbar
                addLabelText={newItemLabelText}
                deleteLabelText="Löschen"
                editLabelText="Bearbeiten"
                additionalCommands={[]}
                canAdd={true}
                canDelete={selectedItemGuids.length >= 1}
                canEdit={selectedItemGuids.length >= 1}
                onAddClicked={() => onAddClicked()}
                onEditClicked={() => setShowEditForm(true)}
                onDeleteClicked={() => {
                  const newValue = fieldValue.filter((item) => !selectedItemGuids.includes(item.Guid));
                  props.onValueChanged(props.fieldDescription, newValue);
                }}></CrudCommandbar>
            </>
          )}

          <GenericList
            onValueChanged={() => {}}
            columnWidthMappings={{}}
            currentFilter={[]}
            data={mappedListItems}
            errorMessage=""
            fieldDescriptions={props.fieldDescription.itemProperties}
            filteredFieldNames={[]}
            listId=""
            listName=""
            onSortAscendingClicked={(fieldName: string) => {
              setSortField(fieldName);
              setSortDirection("ascending");
            }}
            onSortDescendingClicked={(fieldName: string) => {
              setSortField(fieldName);
              setSortDirection("descending");
            }}
            onRenderFooter={listHasValues === true ? renderAddButton : undefined}
            onRenderEmptyListRow={listHasValues !== true ? renderAddButton : undefined}
            onInlineDeleteClicked={
              props.editMode === true
                ? (item) => {
                    props.onValueChanged(
                      props.fieldDescription,
                      fieldValue.filter((itemInValue) => item.Guid !== itemInValue.Guid)
                    );
                  }
                : undefined
            }
            onInlineEditClicked={
              props.editMode === true
                ? (item) => {
                    setSelectedItemGuids([item.Guid]);
                    const items = mapObjectsToListItems(fieldValue, propsToUseForListItem);
                    const itemWithId = items.filter((i) => i.Guid === item.Guid)[0];

                    setItemBeingEdited(itemWithId);

                    setShowEditForm(true);
                  }
                : undefined
            }></GenericList>
        </div>

        <div className="inPrintOnly">
          {mappedListItems.map((mappedIem) => {
            return (
              <>
                <EditorContextProvider editorModel={templateToUseForPrintView} isInEditMode={false}>
                  <>
                    <ListItemContextProvider
                      onFormClose={() => {}}
                      //listItemHasConflictingChanges={() => false}

                      registeredContainerLockedConditions={templateToUseForPrintView.containerFieldsAreLockedConditions}
                      registeredContainerHiddenWhenConditions={templateToUseForPrintView.containerHiddenWhenConditions}
                      onListItemSave={undefined}
                      listItem={mappedIem}>
                      <div>
                        <TemplatedForm editMode={false} injectableComponents={[]} template={templateToUseForPrintView.componentConfig}></TemplatedForm>
                      </div>
                    </ListItemContextProvider>
                  </>
                </EditorContextProvider>
              </>
            );
          })}
        </div>
      </WithErrorsBottom>
    </>
  );
};
