import React, { useEffect, useState } from "react";
import { MessageTypes, WindowMessage } from "../models/WindowMessage";

import log from "loglevel";
import { ComponentContextProvider } from "../../../common/helper/CurrentWebPartContext";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { SPHttpClient, HttpClient } from "@microsoft/sp-http";

import { ModalPopup } from "../../../common/components/modals/ModalPopup";

export const FormInstanceArchivePanel = (props: { onClose: () => void; componentContext: BaseComponentContext; httpClient: HttpClient; spHttpClient: SPHttpClient }): JSX.Element => {
  const [panelIsOpen, setPanelIsOpen] = useState(false);
  const [listItemIdToArchive, setListItemIdToArchive] = useState<number | undefined>(undefined);

  useEffect(() => {
    window.addEventListener<"message">("message", async (event: MessageEvent<WindowMessage>) => {
      if (event.data.messageId !== undefined) {
        log.debug("Received message", event.data);
        switch (event.data.messageId) {
          case MessageTypes.closePanel:
            setPanelIsOpen(false);
            break;
          case MessageTypes.showArchiveFormPage:
            {
              setListItemIdToArchive(event.data.listItemId);
              setPanelIsOpen(true);
            }
            break;
        }
      }
    });
  }, []);

  log.debug("rendering FormiinstanceArchivePanel", {
    panelIsOpen: panelIsOpen
  });

  if (panelIsOpen === false) {
    return <></>;
  }

  const closePanels = (): void => {
    props.onClose();
  };

  const webUrl = props.componentContext.pageContext.web.absoluteUrl;
  const listId = props.componentContext.pageContext.list.id;

  const archiveUrl = "/_layouts/15/ArchiveForm.aspx?SiteUrl=" + encodeURIComponent(webUrl) + "&ListId=" + encodeURIComponent(listId.toString()) + "&ID=" + listItemIdToArchive + "&isDlg=1";
  return (
    <ComponentContextProvider httpClient={props.httpClient} componentContext={props.componentContext} spHttpClient={props.spHttpClient}>
      {panelIsOpen === true && (
        <>
          <ModalPopup
            height={260}
            width={630}
            onClose={() => {
              closePanels();
            }}
            title="Formular abbrechen"
            url={archiveUrl}
          />
        </>
      )}
    </ComponentContextProvider>
  );
};
