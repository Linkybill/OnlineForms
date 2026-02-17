import React, { useState } from "react";
import { Modal, Spinner } from "@fluentui/react";
import { ModalWithCloseButton } from "../components/modals/ModalWithCloseButton";

export interface ILoadingIndicatorContextAccessor {
  setLoadingIndication: (isLoading: boolean, indicatorMessage?: string) => void;
  setLoadingIndicatorMessage: (message: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const LoadingIndicatorContext = React.createContext<ILoadingIndicatorContextAccessor | undefined>(undefined);
export const useLoadingIndicatorContext = () => React.useContext(LoadingIndicatorContext);

export const LoadingIndicatorContextProvider = (props: { isLoading: boolean; message?: string; children: JSX.Element | JSX.Element[] }) => {
  const [loading, setLoading] = useState<boolean>(props.isLoading);
  const [indicatorMessage, setIndicatorMessage] = useState(props.message);

  return (
    <LoadingIndicatorContext.Provider
      value={{
        setLoadingIndication: (isLoading, message) => {
          setLoading(isLoading);
          setIndicatorMessage(message);
        },
        setIsLoading: (isLoading: boolean) => {
          setLoading(isLoading);
        },
        setLoadingIndicatorMessage: (message: string) => {
          setIndicatorMessage(message);
        }
      }}>
      <>
        <>
          <Modal
            isOpen={loading}
            styles={{
              main: {
                width: "400px", // oder eine andere fixe oder max. Breite
                height: "200px",
                margin: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }
            }}>
            <Spinner label={indicatorMessage} />
          </Modal>
        </>
      </>
      {props.children}
    </LoadingIndicatorContext.Provider>
  );
};
