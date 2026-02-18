import * as React from "react";
import { QueryParameterNames } from "../models/Constants";
import log from "loglevel";
import { TemplatedForm } from "../../../common/components/formcomponents/components/templatedForm/TemplatedForm";
import { WithErrorsTop } from "../../../common/components/errorComponent/WithErrorsTop";
import { Modal } from "@fluentui/react";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { ComponentContextProvider } from "../../../common/helper/CurrentWebPartContext";
import { SPHttpClient, HttpClient } from "@microsoft/sp-http";
import { ListItemContextConsumer, ListItemContextProvider } from "../../../common/helper/ListItemContext";
import { EditorContextConsumer, EditorContextProvider } from "../../../common/helper/EditorContext";
import { FormContentService } from "../../../common/services/FormContentService";
import { FormViewModel } from "../models/FormViewModel";
import { FormConfigurationContextProvider } from "../../../common/helper/FormConfigurationContext";
import { ListItem } from "../../../common/listItem/ListItem";

import { closeFormWithRedirect } from "../../../common/helper/CloseForm";
import { sp } from "@pnp/sp";
import { PermissionContextProvider } from "../../../common/helper/PermissionContext";
import { FileWithKey, FormFileContextConsumer, FormFileContextProvider, IFormFileContextAccessor } from "../../../common/helper/FormFileContext";
import { AppConfigurator } from "../../../common/AppConfigurator/AppConfigurator";
import { CustomThemeProvider } from "../../../common/CustomThemeProvider/CustomThemeProvider";
import { FormContentLoadingContextProvider } from "../../../common/helper/FormContentLoadingContext";
import { LoadingIndicatorContextProvider } from "../../../common/helper/LoadingIndicatorContext";
import { useServerLoggingContext } from "../../../common/logging/ServerLoggingContext";
import { Logmodel } from "../../../common/logging/LogModel";
const background = require("../assets/background.svg");

export const FormInstance = (props: { httpClient: HttpClient; spHttpClient: SPHttpClient; context: BaseComponentContext; instanceId: string }): JSX.Element => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [formViewModel, setFormViewModel] = React.useState<FormViewModel>(undefined);

  const currentListItemEtag = React.useRef<string | undefined>(undefined);
  const currentItemId = React.useRef<number | undefined>(undefined);
  const serverLoggingContext = useServerLoggingContext();
  React.useEffect(() => {
    const loadModel = async () => {
      try {
        const service = new FormContentService();

        const params = new URLSearchParams(location.search);
        if (params.has(QueryParameterNames.formId)) {
          const formId = params.get(QueryParameterNames.formId);
          log.debug("formInstance: going to load form with id", formId);
          let resultFromArchive = undefined;
          const searchParams = new URLSearchParams(document.location.search);
          if (!searchParams.has("IgnoreWorkflowStatus")) {
            resultFromArchive = await service.loadListItemFromArchive(formId);
          }
          if (resultFromArchive !== undefined) {
            const link = document.createElement("a");
            link.href = resultFromArchive;

            link.click();
          } else {
            const result = await service.loadFormContent(formId, serverLoggingContext, props.spHttpClient);
            currentListItemEtag.current = result.model.formContent.etag;

            setFormViewModel(result.model);
            currentItemId.current = result.model.formContent.listItem.ID;
            setError(result.error);
          }
        } else {
          const result = await service.initializeFormViewModel(undefined);
          setFormViewModel(result.model);
          setError(result.error);
        }
        setLoading(false);
      } catch (e) {
        const logModel: Logmodel = {
          text: "Es ist ein unerwarteter Fehler beim Laden des Formulars aufgetreten.",
          originalError: e,
          type: "LoadForm"
        };
        await serverLoggingContext.logCollectedLogsAsError(logModel);
        setError("Das Formular konnte nicht geladen werden, bitte nennen Sie folgende CorrelationId dem Serviceteam: " + serverLoggingContext.getCurrentCorrelationId());
        setLoading(false);
      }
    };
    loadModel();
  }, []);

  log.debug("rendering formInstance with: ", {
    model: formViewModel
  });
  const content = (
    <AppConfigurator companyName={""} solutionName={""} componentContext={props.context}>
      <CustomThemeProvider>
        <ComponentContextProvider httpClient={props.httpClient} componentContext={props.context} spHttpClient={props.spHttpClient}>
          <LoadingIndicatorContextProvider isLoading={loading} message="Formulardaten werden geladen.">
            <>
              <WithErrorsTop errors={[error]}></WithErrorsTop>

              {loading === false && formViewModel !== undefined && formViewModel.formTemplate.editorModel !== undefined && (
                <>
                  <FormConfigurationContextProvider>
                    <PermissionContextProvider
                      listItemId={formViewModel === undefined ? undefined : formViewModel.formContent.listItem.ID}
                      templateVersionIdentifier={formViewModel?.formTemplate?.templateVersionIdentifier}>
                      <EditorContextProvider
                        editorModel={{ ...formViewModel.formTemplate.editorModel, customFieldDefinitions: [...formViewModel.formTemplate.editorModel.customFieldDefinitions] }}
                        isInEditMode={false}
                        templateVersionIdentifier={formViewModel?.formTemplate?.templateVersionIdentifier}>
                        <EditorContextConsumer>
                          {(editorContext) => {
                            return (
                              <>
                                <FormFileContextProvider listItemId={formViewModel.formContent.listItem.ID} templateVersionIdentifier={formViewModel?.formTemplate?.templateVersionIdentifier}>
                                  <FormFileContextConsumer>
                                    {(fileContext: IFormFileContextAccessor) => {
                                      return (
                                        <>
                                          <FormContentLoadingContextProvider contentIsLoading={loading}>
                                            <ListItemContextProvider
                                              onFormClose={() => {
                                                closeFormWithRedirect();
                                              }}
                                              //todo: manage eTag

                                              listItemHasConflictingChanges={async () => {
                                                return false;
                                              }}
                                              registeredContainerLockedConditions={editorContext.editorModel().containerFieldsAreLockedConditions}
                                              registeredContainerHiddenWhenConditions={editorContext.editorModel().containerHiddenWhenConditions}
                                              onListItemSave={async (changedItem, filesToUpload: FileWithKey[], fileNamesToDelete: string[], filename: string): Promise<ListItem> => {
                                                const formContentService = new FormContentService();
                                                if (changedItem.ID === undefined) {
                                                  try {
                                                    const item = await formContentService.addFormItem(
                                                      changedItem,
                                                      filesToUpload,
                                                      fileNamesToDelete,
                                                      filename,
                                                      editorContext.editorModel().mirroredSPListFields,
                                                      editorContext.editorModel().ignoreFieldsInItemJSON,
                                                      formViewModel.formTemplate.templateIdenfitier,
                                                      formViewModel.formTemplate.templateVersionIdentifier,
                                                      serverLoggingContext
                                                    );

                                                    currentItemId.current = item.ID;
                                                    fileContext.resetFilesBeingUploaded();
                                                    setFormViewModel((old) => {
                                                      return { ...old, formContent: { ...old.formContent, listItem: item, etag: "-1" } };
                                                    });
                                                    return item;
                                                  } catch (e) {
                                                    const logObject: Logmodel = {
                                                      type: "SaveOrUpdate",
                                                      text: "Das Item konnte nicht gespeichert werden",
                                                      originalError: e
                                                    };
                                                    serverLoggingContext.logCollectedLogsAsError(logObject);
                                                    throw e;
                                                  }
                                                } else {
                                                  const item = await formContentService.updateFormItem(
                                                    changedItem,
                                                    filesToUpload,
                                                    fileNamesToDelete,
                                                    editorContext.editorModel().mirroredSPListFields,
                                                    editorContext.editorModel().ignoreFieldsInItemJSON,
                                                    formViewModel.formTemplate.templateIdenfitier,
                                                    formViewModel.formTemplate.templateVersionIdentifier,
                                                    serverLoggingContext
                                                  );
                                                  fileContext.resetFilesBeingUploaded();
                                                  setFormViewModel((old) => {
                                                    return { ...old, formContent: { ...old.formContent, listItem: item, etag: "-1" } };
                                                  });
                                                  return item;
                                                }
                                              }}
                                              listItem={formViewModel.formContent.listItem}>
                                              <ListItemContextConsumer>
                                                {(listItemContextAccessor) => {
                                                  return (
                                                    <>
                                                      <div style={{}}>
                                                        <>
                                                          {listItemContextAccessor.getBlockingScreenMessage() !== "" && (
                                                            <>
                                                              <Modal isBlocking={true}>{listItemContextAccessor.getBlockingScreenMessage()}</Modal>
                                                            </>
                                                          )}
                                                        </>
                                                        <TemplatedForm editMode={true} injectableComponents={[]} template={formViewModel.formTemplate.editorModel.componentConfig}></TemplatedForm>
                                                      </div>
                                                    </>
                                                  );
                                                }}
                                              </ListItemContextConsumer>
                                            </ListItemContextProvider>
                                          </FormContentLoadingContextProvider>
                                        </>
                                      );
                                    }}
                                  </FormFileContextConsumer>
                                </FormFileContextProvider>
                              </>
                            );
                          }}
                        </EditorContextConsumer>
                      </EditorContextProvider>
                    </PermissionContextProvider>
                  </FormConfigurationContextProvider>
                </>
              )}
            </>
          </LoadingIndicatorContextProvider>
        </ComponentContextProvider>
      </CustomThemeProvider>
    </AppConfigurator>
  );

  const params = new URLSearchParams(location.search);

  if (params.has("openInPanel")) {
    {
      return (
        <div
          style={{
            backgroundPositionX: "100%",
            backgroundRepeat: "no-repeat",
            backgroundImage: loading === true ? "" : "url(" + background + ")",
            backgroundColor: "rgb(250, 250, 250)",
            backgroundSize: "contain",

            width: "100%",
            height: "100vh",
            position: "fixed",
            overflowY: "scroll",
            left: 0,
            top: 0,
            zIndex: 999
          }}>
          <div
            className="formWrapper"
            style={{
              marginTop: "30px",
              marginBottom: "30px",
              backgroundColor: "white",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
              borderBottomLeftRadius: "8px",
              borderBottomRightRadius: "8px",
              boxShadow: "rgba(0, 0, 0, 0.12) 0px 0px 2px 0px, rgba(0, 0, 0, 0.14) 0px 4px 8px 0px"
            }}>
            {content}
          </div>
        </div>
      );
    }
  }
  return content;
};
