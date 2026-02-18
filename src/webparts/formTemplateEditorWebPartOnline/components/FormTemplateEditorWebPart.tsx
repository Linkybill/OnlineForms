import * as React from "react";
import { ComponentContextProvider } from "../../../common/helper/CurrentWebPartContext";
import { ToolpaneComponents } from "../../../common/components/editor/models/ToolPaneComponents";
import { WithErrorsTop } from "../../../common/components/errorComponent/WithErrorsTop";
import { Editor } from "../../../common/components/editor/components/Editor";
import { loadFormTemplate, loadFormTemplateByIdentifier, updateTemplate } from "../../../common/formTemplates/services/FormTemplateService";
import { IFormTemplateEditorWebPartProps } from "./IFormTemplateEditorWebPartProps";
import { FormConfigurationContextProvider } from "../../../common/helper/FormConfigurationContext";
import { sp } from "@pnp/sp";
import { ListNames, UrlParameterNames } from "../../../extensions/formTemplateListActionsOnline/Constants";
import { FormTemplate } from "../../../extensions/common/models/FormTemplate";
import { PermissionContextProvider } from "../../../common/helper/PermissionContext";
import { AppConfigurator } from "../../../common/AppConfigurator/AppConfigurator";
import { CustomThemeProvider } from "../../../common/CustomThemeProvider/CustomThemeProvider";
import { LoadingIndicatorContextProvider } from "../../../common/helper/LoadingIndicatorContext";

export const FormTemplateEditorWebPart = (props: IFormTemplateEditorWebPartProps): JSX.Element => {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [templateItemId, setTemplateItemId] = React.useState<number | undefined>();
  const [currentTemplate, setCurrentTemplate] = React.useState<FormTemplate | undefined>(undefined);

  React.useEffect(() => {
    const loadTemplate = async () => {
      const params = new URLSearchParams(location.search);
      if (params.has(UrlParameterNames.templateItemId)) {
        let templateItemId: number | undefined = undefined;
        try {
          const param = params.get(UrlParameterNames.templateItemId);
          templateItemId = Number.parseInt(param === null ? "" : param);
        } catch (e) {
          setError("die ItemId in der Url ist keine gültige Zahl");
        }

        if (templateItemId !== undefined) {
          const template = await loadFormTemplate(templateItemId);

          if (template.model) setTemplateItemId(templateItemId);
          setError(template.error);
          setCurrentTemplate(template.model);
        }

        setIsLoading(false);
      } else if (params.has(UrlParameterNames.templateIdentifier)) {
        const identifier = params.get(UrlParameterNames.templateIdentifier) || "";
        if (identifier.trim().length === 0) {
          setError("templateIdentifier in der Url ist leer.");
          setIsLoading(false);
          return;
        }

        const template = await loadFormTemplateByIdentifier(identifier);
        if (template.model?.id !== undefined) {
          setTemplateItemId(template.model.id);
        }
        setError(template.error);
        setCurrentTemplate(template.model);
        setIsLoading(false);
      } else {
        setError("Es wurde in der URL kein templateItemId oder templateIdentifier angegeben. Ohne Template kann der Editor nicht angezeigt werden.");
        setIsLoading(false);
      }
    };
    const initializeAndLoadTemplate = async () => {
      await loadTemplate();
    };
    initializeAndLoadTemplate();
  }, []);

  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has("openInPanel")) {
    urlParams.append("openInPanel", "1");
    return <a href={window.location.protocol + "//" + window.location.hostname + "/" + window.location.pathname + "?" + urlParams.toString()}>Templateeditor öffnen</a>;
  }

  const redirectToTemplateList = async () => {
    const templateListView = await sp.site.rootWeb.lists.getByTitle(ListNames.formTemplateListName).defaultView.get();

    window.location.href = templateListView.ServerRelativeUrl;
  };
  return (
    <AppConfigurator companyName="NOVA" componentContext={props.componentContext} solutionName="Forms">
      <CustomThemeProvider>
        <ComponentContextProvider componentContext={props.componentContext} httpClient={props.httpClient} spHttpClient={props.spHttpClient}>
          <>
            <link rel="stylesheet" href="https://static2.sharepointonline.com/files/fabric/office-ui-fabric-core/11.0.0/css/fabric.min.css" />(
            <>
              <LoadingIndicatorContextProvider isLoading={isLoading} message="">
                {isLoading === false && (
                  <>
                    <WithErrorsTop errors={error === undefined ? [] : [error]}></WithErrorsTop>
                    {error === undefined && (
                      <>
                        <PermissionContextProvider listItemId={undefined} listTitle={ListNames.formTemplateListName}>
                          <FormConfigurationContextProvider>
                            <Editor
                              onSaveClick={async (newModel) => {
                                const updateResult = await updateTemplate(templateItemId as number, newModel, props.componentContext, currentTemplate.currentETag);

                                if (updateResult.model !== undefined) {
                                  setCurrentTemplate((old) => {
                                    return { ...old, currentETag: updateResult.model.currentETag };
                                  });
                                }

                                setError(updateResult.error);
                              }}
                              onSaveAndCloseClick={async (newModel) => {
                                const updateResult = await updateTemplate(templateItemId as number, newModel, props.componentContext, currentTemplate.currentETag);
                                if (updateResult.model !== undefined) {
                                  setCurrentTemplate((old) => {
                                    return { ...old, currentETag: updateResult.model.currentETag };
                                  });
                                }

                                setError(updateResult.error);
                                await redirectToTemplateList();
                              }}
                              isLoading={false}
                              onCloseClick={async () => {
                                await redirectToTemplateList();
                              }}
                              availableComponents={{
                                categories: [ToolpaneComponents.componentsCategory]
                              }}
                              editorModel={{ ...currentTemplate.editorModel }}></Editor>
                          </FormConfigurationContextProvider>
                        </PermissionContextProvider>
                      </>
                    )}
                  </>
                )}
              </LoadingIndicatorContextProvider>
            </>
            )
          </>
        </ComponentContextProvider>
      </CustomThemeProvider>
    </AppConfigurator>
  );
};
