import { CommandBar, MessageBar, MessageBarType, Toggle } from "@fluentui/react";
import log from "loglevel";
import { useRef, useState } from "react";
import { DragDropContextProvider, useDragDropContext } from "../../../helper/DragDropContext";
import { EditorContextConsumer, EditorContextProvider } from "../../../helper/EditorContext";
import { EditorModel } from "../models/EditorModel";
import { DropTargetOrRenderedEditor } from "./DropTargetOrRenderedEditor";
import { CustomFieldList } from "./fieldEditor/CustomFieldList";
import { IToolpaneCategory, IToolpaneProps, Toolbar } from "./Toolbar/Toolbar";
import * as React from "react";
import { ModalWithCloseButton } from "../../modals/ModalWithCloseButton";
import { TemplatedForm } from "../../formcomponents/components/templatedForm/TemplatedForm";
import { ListItemContextConsumer, ListItemContextProvider } from "../../../helper/ListItemContext";
import { mapFieldDescriptionsToDraggableComponents } from "./manager/FieldSchemaManager";
import { ListItem } from "../../../listItem/ListItem";
import { createDefaultItem } from "../../../listItem/helper/ListHelper";
import { ActionTrigger } from "../../../actions/models/ActionTrigger";
import { ActionTriggerList } from "../../../actions/components/ActionTriggerList";
import { DataSourcelist } from "../../../actions/components/datasources/DataSourceList";
import { CustomFieldEditor } from "./fieldEditor/CustomFieldEditor";
import { ParameterPickerContextProvider } from "../../../helper/parameterPickerContext/ParameterPickerContext";
import { ActrionTriggerDragDropProvider } from "../../../actions/components/ActionTriggerDragDropContext";
import { usePermissionContext } from "../../../helper/PermissionContext";

export const Editor: React.FC<{
  isLoading: boolean;
  editorModel: EditorModel;
  availableComponents: IToolpaneProps;
  onSaveClick: (editrModel: EditorModel) => void;
  onCloseClick: () => void;
  onSaveAndCloseClick: (editorModel: EditorModel) => void;
}> = (props): JSX.Element => {
  const [toolbarRef, setToolbarRef] = useState<HTMLDivElement | null>(null);
  const [fieldListVisible, setFieldListVisible] = useState<boolean>(false);
  const [datasourceListVisibe, setDatasourceListVisibe] = useState<boolean>(false);
  const [showTriggersWhichStartOnOpenForm, setShowTriggersWhichStartOnOpenForm] = useState<boolean>(false);
  const [showTriggersWhichStartOnBeforeSave, setShowTriggersWhichStartOnBeforeSave] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [parameterSimulatorVisible, setParameterSimulatorVisible] = useState<boolean>(false);

  const ensureCustomFieldsCategoryToBeInAvailableComponents = (editorModel: EditorModel, availableToolpaneCategories: IToolpaneCategory[]): IToolpaneCategory[] => {
    const mappedComponentsFields = mapFieldDescriptionsToDraggableComponents([...editorModel.customFieldDefinitions]);

    const fieldsCategoryIndex = availableToolpaneCategories.findIndex((c) => c.title === "Benutzerdefinierte Felder");

    if (fieldsCategoryIndex !== -1) {
      availableToolpaneCategories[fieldsCategoryIndex].components = mappedComponentsFields;
    } else {
      availableToolpaneCategories.push({
        title: "Benutzerdefinierte Felder",
        components: mappedComponentsFields
      });
    }
    return availableToolpaneCategories;
  };

  const dragDivRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const dragContext = useDragDropContext();

  const permissionContext = usePermissionContext();

  log.debug("rendering editor with", props);
  const currentListItem = useRef<ListItem>(createDefaultItem(props.editorModel.customFieldDefinitions, "", []));
  return (
    <EditorContextProvider editorModel={props.editorModel} isInEditMode={true}>
      <EditorContextConsumer>
        {(editorContext) => {
          return (
            <>
              <DragDropContextProvider>
                <ListItemContextProvider
                  onFormClose={() => {
                    log.debug("form closed");
                  }}
                  registeredContainerHiddenWhenConditions={editorContext.editorModel().containerHiddenWhenConditions}
                  registeredContainerLockedConditions={editorContext.editorModel().containerFieldsAreLockedConditions}
                  onListItemSave={(listItem) => {
                    log.debug("saved item in editor!!!");
                    return listItem;
                  }}
                  listItem={currentListItem.current}>
                  <ListItemContextConsumer>
                    {(listItemContextAccessor) => {
                      return (
                        <EditorContextConsumer>
                          {(editorContext) => {
                            return (
                              <ParameterPickerContextProvider editorModelForParameterPicker={editorContext.editorModel()} listItemContextForParameterPicker={listItemContextAccessor}>
                                <ModalWithCloseButton
                                  title="Editorcontainer"
                                  isOpen={true}
                                  styles={{
                                    layer: {
                                      width: "100%"
                                    },
                                    main: { width: "100%", overflow: "visible", height: "100vh" },
                                    scrollableContent: {
                                      overflow: "hidden"
                                    }
                                  }}
                                  onClose={props.onCloseClick}>
                                  <div
                                    onDragOver={(event) => {
                                      if (dragDivRef.current !== null) {
                                        dragDivRef.current.style.left = event.clientX - 10 + "px";
                                        dragDivRef.current.style.top = event.clientY - 10 + "px";
                                      }
                                    }}
                                    className="EditorContainer"
                                    onScroll={(div) => {
                                      log.debug("editor, scroll", div.currentTarget.scrollTop);
                                      if (div.currentTarget.scrollTop === 0) {
                                        (toolbarRef as HTMLDivElement).style.position = "relative";
                                      } else {
                                        (toolbarRef as HTMLDivElement).style.position = "fixed";
                                      }
                                    }}
                                    style={{
                                      height: "85vh",
                                      width: "100%",
                                      overflow: "scroll"
                                    }}>
                                    <div style={{ paddingLeft: "15px", width: "95%", minHeight: "400vh" }}>
                                      {dragContext.contentBeingDragged !== undefined && (
                                        <div
                                          ref={dragDivRef}
                                          style={{
                                            position: "absolute",
                                            zIndex: 99999,
                                            borderStyle: "solid",
                                            borderColor: "black"
                                          }}>
                                          {dragContext.contentBeingDragged}
                                        </div>
                                      )}

                                      <>
                                        <>
                                          <div
                                            className="Toolbar"
                                            ref={setToolbarRef}
                                            style={{
                                              position: "relative",
                                              width: "85%",
                                              backgroundColor: "white",
                                              zIndex: 99
                                            }}>
                                            <div>
                                              <CommandBar
                                                items={[
                                                  {
                                                    disabled: editorContext?.historyNavigator.canMoveBackward() === false,
                                                    onClick: () => {
                                                      if (editorContext !== undefined) {
                                                        const prevItem = editorContext.historyNavigator.moveBackward();
                                                        // todo: History needs to manage editorModel
                                                        log.debug("history: clicked undo", prevItem);

                                                        editorContext.setUniqueComponentKeys(prevItem.uniqueComponentKeys);

                                                        editorContext.setEditorModel(prevItem);
                                                        // todo: handle change
                                                      }
                                                    },
                                                    key: "undo",
                                                    iconProps: {
                                                      iconName: "Undo"
                                                    }
                                                  },
                                                  {
                                                    disabled: editorContext?.historyNavigator.canMoveForward() === false,
                                                    onClick: () => {
                                                      if (editorContext !== undefined) {
                                                        const nextItem = editorContext.historyNavigator.moveForward();
                                                        log.debug("history: clicked history redo", nextItem);
                                                        editorContext.setUniqueComponentKeys(nextItem.uniqueComponentKeys);

                                                        log.debug("Editor: calling editormodelChanged", props);
                                                        editorContext.setEditorModel(nextItem);
                                                      }
                                                    },
                                                    key: "redo",
                                                    iconProps: {
                                                      iconName: "Redo"
                                                    }
                                                  },
                                                  {
                                                    disabled: editorContext?.historyNavigator.currentChangeDiffersFromInitial() === false,
                                                    key: "saveTemplate",
                                                    iconProps: { iconName: "Save" },
                                                    onClick: () => {
                                                      log.debug("Editor: save clicked", {
                                                        editorInfos: editorContext
                                                      });

                                                      if (editorContext !== undefined) {
                                                        props.onSaveClick(editorContext.editorModel());
                                                      }
                                                    }
                                                  },
                                                  {
                                                    disabled: editorContext?.historyNavigator.currentChangeDiffersFromInitial() === false,
                                                    key: "saveTemplateAndClose",
                                                    iconProps: { iconName: "SaveAndClose" },
                                                    onClick: () => {
                                                      log.debug("Editor: onSaveAndCloseClicked", editorContext);
                                                      if (editorContext !== undefined) {
                                                        log.debug("Editor: calling props.onSaveAndClose", props);
                                                        props.onSaveAndCloseClick(editorContext.editorModel());
                                                      }
                                                    }
                                                  },
                                                  {
                                                    key: "customFields",
                                                    disabled: false,
                                                    text: "Benutzerdefinierte Felder",
                                                    onClick: () => {
                                                      setFieldListVisible(true);
                                                    }
                                                  },

                                                  {
                                                    key: "datasources",
                                                    disabled: false,
                                                    text: "Datenquellen",
                                                    onClick: () => {
                                                      setDatasourceListVisibe(true);
                                                    }
                                                  },
                                                  {
                                                    key: "formDatasourceTrigger",
                                                    text: "Formular Öffnen Aktionen",
                                                    onClick: () => {
                                                      setShowTriggersWhichStartOnOpenForm(true);
                                                    }
                                                  },
                                                  {
                                                    key: "saveFormTriggers",
                                                    text: "Formular Speichern Aktionen",
                                                    onClick: () => {
                                                      setShowTriggersWhichStartOnBeforeSave(true);
                                                    }
                                                  },
                                                  /*{
                                                    key: "Parametersimulator",
                                                    disabled: false,
                                                    text: "Parameter zum Testen setzen",
                                                    onClick: () => {
                                                      setParameterSimulatorVisible(true);
                                                    }
                                                  },*/
                                                  {
                                                    key: "userCanRead",
                                                    disabled: false,
                                                    onRender: () => {
                                                      return (
                                                        <Toggle
                                                          checked={permissionContext.currentUserCanWrite() === true}
                                                          label={permissionContext.currentUserCanWrite() === true ? "Aktueller Benutzer kann schreiben" : "Aktueller Benutzer kann nicht schreiben"}
                                                          onChange={(event, val) => {
                                                            permissionContext.setCurrentUserCanWrite(val);
                                                          }}></Toggle>
                                                      );
                                                    }
                                                  },
                                                  {
                                                    key: "formPreview",
                                                    disabled: false,
                                                    text: "Formular Preview",
                                                    onClick: () => {
                                                      setPreviewVisible(true);
                                                    }
                                                  }
                                                ]}></CommandBar>
                                            </div>
                                            <div style={{}}>
                                              <Toolbar categories={ensureCustomFieldsCategoryToBeInAvailableComponents(editorContext.editorModel(), props.availableComponents.categories)} />
                                            </div>
                                          </div>
                                          <br />
                                          <div className="EditorContent">
                                            {error !== undefined && (
                                              <>
                                                <MessageBar messageBarType={MessageBarType.error} isMultiline={false} onDismiss={() => setError(undefined)} dismissButtonAriaLabel="Close">
                                                  {error}
                                                </MessageBar>
                                              </>
                                            )}
                                            {fieldListVisible === true && (
                                              <>
                                                <ModalWithCloseButton
                                                  title="Felder..."
                                                  isOpen={true}
                                                  onClose={() => {
                                                    setFieldListVisible(false);
                                                  }}
                                                  styles={{
                                                    main: {
                                                      width: "80%"
                                                    }
                                                  }}>
                                                  <CustomFieldList
                                                    fieldTriggers={editorContext.editorModel().fieldTriggers}
                                                    onTriggerListUpdated={(newTriggerList: ActionTrigger[]): void => {
                                                      const newModel: EditorModel = { ...editorContext.editorModel(), fieldTriggers: newTriggerList };
                                                      editorContext.setEditorModel(newModel);
                                                    }}
                                                    onFieldListUpdated={(fields, saveTemplate) => {
                                                      const newModel = { ...editorContext.editorModel() };
                                                      newModel.customFieldDefinitions = fields;
                                                      const defaultItem = createDefaultItem([...newModel.customFieldDefinitions], "", []);
                                                      currentListItem.current = defaultItem;
                                                      listItemContextAccessor.replaceListItemAndTriggerConditions(defaultItem); //todo: check why state setting of editormodel is not enough
                                                      editorContext.setEditorModel(newModel);
                                                      if (saveTemplate == true) {
                                                        props.onSaveClick(newModel);
                                                      }
                                                    }}
                                                    fields={editorContext.editorModel().customFieldDefinitions === undefined ? [] : editorContext.editorModel().customFieldDefinitions}></CustomFieldList>
                                                </ModalWithCloseButton>
                                              </>
                                            )}
                                            {editorContext.getFieldNameBeingEdited() !== undefined && (
                                              <>
                                                <ModalWithCloseButton
                                                  isOpen={true}
                                                  onClose={() => {
                                                    editorContext.closeFieldEditPanel();
                                                  }}
                                                  title="Feld bearbeiten"
                                                  styles={{
                                                    main: {
                                                      minWidth: 500,
                                                      width: 800
                                                    }
                                                  }}>
                                                  <CustomFieldEditor
                                                    onTriggerListUpdated={(newTriggerList: ActionTrigger[]): void => {
                                                      const newModel: EditorModel = { ...editorContext.editorModel(), fieldTriggers: newTriggerList };
                                                      editorContext.setEditorModel(newModel);
                                                    }}
                                                    onCloseClicked={() => {
                                                      editorContext.closeFieldEditPanel();
                                                    }}
                                                    onFieldChanged={(field, saveTemplate: boolean) => {
                                                      const index = editorContext.editorModel().customFieldDefinitions.findIndex((val) => {
                                                        return val.internalName === editorContext.getFieldNameBeingEdited();
                                                      });
                                                      if (index > -1) {
                                                        const newDefinitions = editorContext.editorModel().customFieldDefinitions;
                                                        newDefinitions[index] = field;
                                                        const newEditorModel = { ...editorContext.editorModel(), customFieldDefinitions: [...newDefinitions] };
                                                        editorContext.setEditorModel(newEditorModel);
                                                        const defaultItem = createDefaultItem([...newDefinitions], "", []);
                                                        listItemContextAccessor.replaceListItemAndTriggerConditions(defaultItem); //todo: check why state setting of editormodel is not enough

                                                        editorContext.setEditorModel(newEditorModel);
                                                        if (saveTemplate == true) {
                                                          props.onSaveClick(newEditorModel);
                                                        }
                                                      }
                                                    }}
                                                    value={editorContext.editorModel().customFieldDefinitions.filter((def) => def.internalName === editorContext.getFieldNameBeingEdited())[0]}></CustomFieldEditor>
                                                </ModalWithCloseButton>
                                              </>
                                            )}
                                            {showTriggersWhichStartOnOpenForm === true && (
                                              <>
                                                <ModalWithCloseButton
                                                  title="Formular Öffnen Aktionen"
                                                  isOpen={true}
                                                  onClose={() => {
                                                    setShowTriggersWhichStartOnOpenForm(false);
                                                  }}
                                                  styles={{
                                                    scrollableContent: {
                                                      width: "100%",
                                                      overflowX: "visible"
                                                    },
                                                    main: {
                                                      width: "80%"
                                                    }
                                                  }}>
                                                  <ActrionTriggerDragDropProvider
                                                    actionTrigger={editorContext.editorModel().startupTriggers}
                                                    onTriggerChanged={(newTriggerList) => {
                                                      const newEditorModel: EditorModel = { ...editorContext.editorModel(), startupTriggers: newTriggerList };
                                                      editorContext.setEditorModel(newEditorModel);
                                                    }}>
                                                    <ActionTriggerList
                                                      parentContainerId=""
                                                      saveImmediatly={true}
                                                      actionTrigger={editorContext.editorModel().startupTriggers}
                                                      onTriggerListChanged={(newTriggerList) => {
                                                        const newEditorModel: EditorModel = { ...editorContext.editorModel(), startupTriggers: newTriggerList };
                                                        editorContext.setEditorModel(newEditorModel);
                                                      }}
                                                    />
                                                  </ActrionTriggerDragDropProvider>
                                                </ModalWithCloseButton>
                                              </>
                                            )}
                                            {showTriggersWhichStartOnBeforeSave === true && (
                                              <>
                                                <ModalWithCloseButton
                                                  title="Speichernaktionen"
                                                  isOpen={true}
                                                  onClose={() => {
                                                    setShowTriggersWhichStartOnBeforeSave(false);
                                                  }}
                                                  styles={{
                                                    scrollableContent: {
                                                      width: "100%",
                                                      overflowX: "visible"
                                                    },
                                                    main: {
                                                      width: "80%"
                                                    }
                                                  }}>
                                                  <ActrionTriggerDragDropProvider
                                                    onTriggerChanged={(newTriggerList) => {
                                                      const newEditorModel: EditorModel = { ...editorContext.editorModel(), saveTriggers: newTriggerList };
                                                      editorContext.setEditorModel(newEditorModel);
                                                    }}
                                                    actionTrigger={editorContext.editorModel().saveTriggers}>
                                                    <ActionTriggerList
                                                      parentContainerId=""
                                                      saveImmediatly={true}
                                                      actionTrigger={editorContext.editorModel().saveTriggers}
                                                      onTriggerListChanged={(newTriggerList) => {
                                                        const newEditorModel: EditorModel = { ...editorContext.editorModel(), saveTriggers: newTriggerList };
                                                        editorContext.setEditorModel(newEditorModel);
                                                      }}
                                                    />
                                                  </ActrionTriggerDragDropProvider>
                                                </ModalWithCloseButton>
                                              </>
                                            )}
                                            {datasourceListVisibe === true && (
                                              <>
                                                <ModalWithCloseButton
                                                  title="Datenquellen..."
                                                  isOpen={true}
                                                  onClose={() => {
                                                    setDatasourceListVisibe(false);
                                                  }}
                                                  styles={{
                                                    main: {
                                                      width: 800
                                                    }
                                                  }}>
                                                  <DataSourcelist
                                                    datasources={editorContext.editorModel().datasources}
                                                    onDatasourceListChanged={(newList) => {
                                                      log.debug("datasourceList changed", newList);
                                                      const newEditorModel: EditorModel = { ...editorContext.editorModel(), datasources: newList };
                                                      editorContext.setEditorModel(newEditorModel);
                                                    }}
                                                  />
                                                </ModalWithCloseButton>
                                              </>
                                            )}
                                            {previewVisible === true && (
                                              <>
                                                <ModalWithCloseButton
                                                  title="Formularpreview"
                                                  isOpen={true}
                                                  onClose={() => {
                                                    setPreviewVisible(false);
                                                  }}
                                                  styles={{
                                                    main: {
                                                      width: "90%",
                                                      height: "90%"
                                                    }
                                                  }}>
                                                  <EditorContextProvider isInEditMode={false} editorModel={editorContext.editorModel()}>
                                                    <TemplatedForm
                                                      injectableComponents={[]}
                                                      editMode={true}
                                                      onSubmit={(item) => {
                                                        log.debug("Formularpreview, submitted item", item);
                                                      }}
                                                      template={editorContext.editorModel().componentConfig}></TemplatedForm>
                                                  </EditorContextProvider>
                                                </ModalWithCloseButton>
                                              </>
                                            )}
                                            {parameterSimulatorVisible === true && (
                                              <>
                                                <ModalWithCloseButton
                                                  title="Parameter simulieren"
                                                  isOpen={true}
                                                  onClose={() => {
                                                    setParameterSimulatorVisible(false);
                                                  }}
                                                  styles={{
                                                    main: {
                                                      width: "90%",
                                                      height: "90%"
                                                    }
                                                  }}>
                                                  <EditorContextProvider isInEditMode={false} editorModel={editorContext.editorModel()}>
                                                    <ListItemContextProvider
                                                      onFormClose={() => {
                                                        setParameterSimulatorVisible(false);
                                                      }}
                                                      registeredContainerHiddenWhenConditions={{}}
                                                      registeredContainerLockedConditions={{}}
                                                      onListItemSave={(listItem, fileName): ListItem => {
                                                        return listItem;
                                                      }}
                                                      listItem={new ListItem(undefined)}>
                                                      todo: implement parameterSimulator
                                                    </ListItemContextProvider>
                                                  </EditorContextProvider>
                                                </ModalWithCloseButton>
                                              </>
                                            )}
                                            <div>
                                              <DropTargetOrRenderedEditor
                                                editorModel={editorContext.editorModel()}
                                                onComponentDeleted={() => {
                                                  log.debug("deleting a component", editorContext);
                                                  if (editorContext !== undefined) {
                                                    const newModel: EditorModel = {
                                                      componentConfig: null,
                                                      uniqueComponentKeys: [],
                                                      customFieldDefinitions: editorContext.editorModel().customFieldDefinitions,
                                                      datasources: editorContext.editorModel().datasources,
                                                      fieldTriggers: editorContext.editorModel().fieldTriggers,
                                                      saveTriggers: editorContext.editorModel().saveTriggers,
                                                      startupTriggers: editorContext.editorModel().startupTriggers,
                                                      containerHiddenWhenConditions: {},
                                                      containerFieldsAreLockedConditions: {}
                                                    };

                                                    editorContext.setUniqueComponentKeys([]);

                                                    editorContext.setEditorModel(newModel);
                                                  }
                                                }}
                                                onComponentAddedOrUpdated={(newComponent) => {
                                                  if (editorContext !== undefined) {
                                                    const newModel = editorContext.editorModel();
                                                    newModel.componentConfig = newComponent;
                                                    log.debug("editor, model changed, going to add historyItem");

                                                    editorContext.setEditorModel(newModel);
                                                  }
                                                }}
                                              />
                                            </div>
                                          </div>
                                        </>
                                      </>
                                    </div>
                                  </div>
                                </ModalWithCloseButton>
                              </ParameterPickerContextProvider>
                            );
                          }}
                        </EditorContextConsumer>
                      );
                    }}
                  </ListItemContextConsumer>
                </ListItemContextProvider>
              </DragDropContextProvider>
            </>
          );
        }}
      </EditorContextConsumer>
    </EditorContextProvider>
  );
};
