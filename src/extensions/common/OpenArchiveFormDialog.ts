import { MessageTypes, WindowMessage } from "./models/WindowMessage";

export const openArchiveFormDialog = (itemId: number | undefined) => {
  const message: WindowMessage = {
    messageId: MessageTypes.showArchiveFormPage,

    listItemId: itemId
  };
  window.postMessage(message, window.location.href);
};
