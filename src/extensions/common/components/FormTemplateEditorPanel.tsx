import React, { useEffect, useState } from "react";
import { MessageTypes, WindowMessage } from "../models/WindowMessage";
import { ModalWithCloseButton } from "../../../common/components/modals/ModalWithCloseButton";
import log from "loglevel";
import { ComponentContextProvider } from "../../../common/helper/CurrentWebPartContext";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { SPHttpClient, HttpClient } from "@microsoft/sp-http";
import { FormTemplatePropertiesEditor } from "./FormTemplatePropertiesEditor";
import { LoadingIndicatorContext, LoadingIndicatorContextProvider } from "../../../common/helper/LoadingIndicatorContext";

export const FormTemplateEditorPanel = (props: { onClose: () => void; componentContext: BaseComponentContext; httpClient: HttpClient; spHttpClient: SPHttpClient }): JSX.Element => {
  const [newTemplatePanelIsOpen, setNewTemplatePanelIsOpen] = useState(false);
  const [baseTemplateItemId, setBaseTemplateItemId] = useState<number | undefined>(undefined);

  useEffect(() => {
    window.addEventListener<"message">("message", async (event: MessageEvent<WindowMessage>) => {
      if (event.data.messageId !== undefined) {
        log.debug("Received message", event.data);
        switch (event.data.messageId) {
          case MessageTypes.closePanel:
            setNewTemplatePanelIsOpen(false);
            break;
          case MessageTypes.openNewTemplatePanel:
            {
              setBaseTemplateItemId(event.data.baseTemplateItemId);
              setNewTemplatePanelIsOpen(true);
            }
            break;
        }
      }
    });
  }, []);

  log.debug("rendering FormTemplateEditorPanel with", {
    newFormIsOpen: newTemplatePanelIsOpen
  });

  if (newTemplatePanelIsOpen === false) {
    return <></>;
  }

  const closePanels = (): void => {
    props.onClose();
  };

  return (
    <LoadingIndicatorContextProvider isLoading={false}>
      <ComponentContextProvider httpClient={props.httpClient} componentContext={props.componentContext} spHttpClient={props.spHttpClient}>
        {newTemplatePanelIsOpen === true && (
          <>
            <ModalWithCloseButton
              onClose={() => {
                closePanels();
              }}
              title="Template"
              isOpen={newTemplatePanelIsOpen}>
              <FormTemplatePropertiesEditor
                baseTemplateId={baseTemplateItemId}
                onUpdateSuccessfull={() => {
                  location.reload();
                }}
              />
            </ModalWithCloseButton>
          </>
        )}
      </ComponentContextProvider>
    </LoadingIndicatorContextProvider>
  );
};
