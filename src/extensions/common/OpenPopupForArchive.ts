import { MessageTypes, WindowMessage } from "./models/WindowMessage";

export const openPopupForArchive = async (itemId: number) => {
  const message: WindowMessage = {
    messageId: MessageTypes.openNewTemplatePanel,
    listItemId: itemId
  };
  window.postMessage(message, window.location.href);
};
