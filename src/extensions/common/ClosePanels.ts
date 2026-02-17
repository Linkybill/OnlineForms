import { MessageTypes, WindowMessage } from "./models/WindowMessage";

export const closePanels = () => {
  const message: WindowMessage = {
    messageId: MessageTypes.closePanel,
    templateItemId: undefined
  };
  window.postMessage(message, window.location.href);
};
