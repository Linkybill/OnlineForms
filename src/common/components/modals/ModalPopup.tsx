import React, { useRef, useState } from "react";
import { ModalWithCloseButton } from "./ModalWithCloseButton";
import { Spinner } from "@fluentui/react";

export interface ModalPopupProps {
  triggerContentRerender?: () => void;
  url: string;
  title: string;
  width: number;
  height: number;
  onClose: () => void;
}

export interface ModalPopupOptions {
  url: string;
  title: string;
  width: number;
  height: number;
}
export const ModalPopup = (props: ModalPopupProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsloading] = useState(true);
  const [message, setMessage] = useState<string>("");

  const hookDoPostBack = (iframe: HTMLIFrameElement, onPostBackStart: () => void) => {
    try {
      const win = iframe.contentWindow as any;
      if (!win || typeof win.WebForm_DoPostBackWithOptions !== "function") {
        console.warn("⚠️ WebForm_DoPostBackWithOptions nicht verfügbar im iframe");
        return;
      }

      if (win.WebForm_DoPostBackWithOptions.__isHooked) return;

      const original = win.WebForm_DoPostBackWithOptions;

      win.WebForm_DoPostBackWithOptions = function (options: any) {
        console.log("🟡 WebForm_DoPostBackWithOptions erkannt:", options);

        // Vor dem eigentlichen PostBack
        onPostBackStart();

        // Dann normal fortfahren
        return original.apply(this, arguments);
      };

      win.WebForm_DoPostBackWithOptions.__isHooked = true;
    } catch (e) {
      console.error("❌ Fehler beim Hooken von WebForm_DoPostBackWithOptions:", e);
    }
  };

  const injectCommitPopup = () => {
    try {
      const iframe = iframeRef.current;
      const win = iframe?.contentWindow;
      if (win && win.frameElement && typeof win.frameElement["commitPopup"] !== "function") {
        win.frameElement["commitPopup"] = (result: any) => {
          console.log("commitPopup aufgerufen:", result);
          props.onClose();
        };
      }

      hookDoPostBack(iframeRef.current, () => {
        setIsloading(true);
        setMessage("Das Formular wird abgebrochen.");
      });
    } catch (e) {
      console.warn("Konnte commitPopup nicht setzen:", e);
    }
    setIsloading(false);
  };

  return (
    <ModalWithCloseButton styles={{ main: { width: props.width, height: props.height }, scrollableContent: { overflowY: "hidden" } }} isOpen={true} onClose={props.onClose} title={props.title}>
      <div style={{ paddingLeft: 15 }}>
        {isLoading == true && (
          <>
            <Spinner label={message} />
          </>
        )}

        <iframe
          width={"100%"}
          style={{
            width: "100%",
            height: "100vh",
            border: "none",
            overflow: "hidden"
          }}
          onSubmit={() => {
            injectCommitPopup;
          }}
          onLoad={injectCommitPopup}
          ref={iframeRef}
          src={props.url}></iframe>
      </div>
    </ModalWithCloseButton>
  );
};
