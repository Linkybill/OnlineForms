import React, { useEffect, useState } from "react";
import log from "loglevel";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { SPHttpClient } from "@microsoft/sp-http";
import { MessageTypes, WindowMessage } from "../../../common/models/WindowMessage";
import { ModalWithCloseButton } from "../../../../common/components/modals/ModalWithCloseButton";
import { sp } from "@pnp/sp";

export const FormTemplateContextMenuHandler = (props: { onClose: () => void; componentContext: BaseComponentContext; spHttpClient: SPHttpClient }): JSX.Element => {
  const [editorUrlsForSubWeb, setEditorUrlsForSubWeb] = useState<string[]>([]);
  useEffect(() => {
    window.addEventListener<"message">("message", async (event: MessageEvent<WindowMessage>) => {
      if (event.data.messageId !== undefined) {
        log.debug("Received message", event.data);

        switch (event.data.messageId) {
          case MessageTypes.closePanel:
            break;
          case MessageTypes.showTemplateWebUrlDropdownsWithRedirectToEditorInSubWeb: {
            const createAbsoluteUrl = async (siteCollectionRelativeUrl: string): Promise<string> => {
              const rootWeb = await sp.site.rootWeb.get();
              const absoluteUrl = rootWeb.Url + siteCollectionRelativeUrl + "/SitePages/FormTemplate.aspx?templateItemId=" + event.data.templateItemId + "&openInPanel=1";
              return absoluteUrl;
            };

            if (event.data.urlsForRedirectToEditorInSubWeb !== null && event.data.urlsForRedirectToEditorInSubWeb !== undefined) {
              if (event.data.urlsForRedirectToEditorInSubWeb.length === 1) {
                const fullUrl = await createAbsoluteUrl(event.data.urlsForRedirectToEditorInSubWeb[0]);
                location.href = fullUrl;
              }
              if (event.data.urlsForRedirectToEditorInSubWeb.length > 1) {
                setEditorUrlsForSubWeb(event.data.urlsForRedirectToEditorInSubWeb);
              }
            }
            setEditorUrlsForSubWeb(event.data.urlsForRedirectToEditorInSubWeb);
            break;
          }
        }
      }
    });
  }, []);

  const closePanels = (): void => {
    props.onClose();
  };
  return (
    <>
      {editorUrlsForSubWeb.length > 1 && (
        <>
          <ModalWithCloseButton
            onClose={() => {
              closePanels();
            }}
            title="Redirecturl auswählen"
            isOpen={true}>
            {editorUrlsForSubWeb.map((url) => (
              <div>
                <a href="{url}">{url}</a>
              </div>
            ))}
          </ModalWithCloseButton>
        </>
      )}
    </>
  );
};
