import { MessageTypes, WindowMessage } from "./models/WindowMessage";

export const openNewTemplateDialog = (baseTemplateItemId: number | undefined) => {
  const message: WindowMessage = {
    messageId: MessageTypes.openNewTemplatePanel,
    templateItemId: undefined,
    baseTemplateItemId: baseTemplateItemId
  };
  window.postMessage(message, window.location.href);
};
