import React, { useEffect, useRef, useState } from "react";
import log from "loglevel";
import { useLoadingIndicatorContext } from "./LoadingIndicatorContext";

export interface IFormContentLoadedAccessor {
  addFormToBeLoaded: () => void;
  addLoadedForm: () => void;
  numberOfFormsToBeLoaded: number;
}

export const FormContentLoadingContext = React.createContext<IFormContentLoadedAccessor | undefined>(undefined);
export const useFormContentLoadingContext = () => React.useContext(FormContentLoadingContext);

export const FormContentLoadingContextProvider = (props: { contentIsLoading: boolean; children: JSX.Element | JSX.Element[] }) => {
  const setPageLoadedCookie = () => {
    const date = new Date();
    date.setTime(date.getTime() + 10); // Ablaufdatum berechnen

    document.cookie = "pageLoaded=true; path=/";
  };

  const numberOfFormsToBeLoaded = useRef<number>(0);
  const numberOfFormsLoaded = useRef<number>(0);
  const numberOfPendingLoadedForms = useRef<number>(0);

  const [isRendering, setIsRendering] = useState<boolean>(true);
  const cookieTimeoutId = useRef<number | undefined>(undefined);
  const completionCheckTimeoutId = useRef<number | undefined>(undefined);
  const loadingIndicationContext = useLoadingIndicatorContext();

  const cancelCompletionCheck = () => {
    if (completionCheckTimeoutId.current !== undefined) {
      window.clearTimeout(completionCheckTimeoutId.current);
      completionCheckTimeoutId.current = undefined;
    }
  };

  const ensureRenderingActive = () => {
    if (isRendering === false) {
      setIsRendering(true);
    }
  };

  const scheduleCompletionCheck = () => {
    const thereAreRegisteredForms = numberOfFormsToBeLoaded.current > 0;
    const allFormsHaveFinishedLoading = thereAreRegisteredForms && numberOfFormsToBeLoaded.current === numberOfFormsLoaded.current;

    if (allFormsHaveFinishedLoading) {
      if (completionCheckTimeoutId.current === undefined) {
        completionCheckTimeoutId.current = window.setTimeout(() => {
          completionCheckTimeoutId.current = undefined;

          const stillAllFinished = numberOfFormsToBeLoaded.current > 0 && numberOfFormsToBeLoaded.current === numberOfFormsLoaded.current;

          if (stillAllFinished) {
            setIsRendering(false);
          }
        }, 0);
      }
    } else {
      cancelCompletionCheck();
      ensureRenderingActive();
    }
  };

  useEffect(() => {
    if (props.contentIsLoading === true) {
      numberOfFormsToBeLoaded.current = 0;
      numberOfFormsLoaded.current = 0;
      numberOfPendingLoadedForms.current = 0;
      cancelCompletionCheck();
      setIsRendering(true);
    } else if (numberOfFormsToBeLoaded.current === 0 && numberOfFormsLoaded.current === 0 && numberOfPendingLoadedForms.current === 0) {
      scheduleCompletionCheck();
    }
  }, [props.contentIsLoading]);

  useEffect(() => {
    loadingIndicationContext.setLoadingIndication(isRendering, "Formularaktionen werden ausgeführt");
    if (isRendering === false) {
      cookieTimeoutId.current = window.setTimeout(() => {
        log.debug("going to set pageLoaded cookie");
        loadingIndicationContext.setIsLoading(false);
        setPageLoadedCookie();
        cookieTimeoutId.current = undefined;
      }, 0);
    } else {
      loadingIndicationContext.setIsLoading(true);
      if (cookieTimeoutId.current !== undefined) {
        window.clearTimeout(cookieTimeoutId.current);
        cookieTimeoutId.current = undefined;
      }
    }

    return () => {
      if (cookieTimeoutId.current !== undefined) {
        window.clearTimeout(cookieTimeoutId.current);
        cookieTimeoutId.current = undefined;
      }
      cancelCompletionCheck();
    };
  }, [isRendering]);

  return (
    <FormContentLoadingContext.Provider
      value={{
        numberOfFormsToBeLoaded: numberOfFormsToBeLoaded.current,
        addFormToBeLoaded: () => {
          numberOfFormsToBeLoaded.current += 1;

          if (numberOfPendingLoadedForms.current > 0) {
            const numberOfOpenForms = Math.max(0, numberOfFormsToBeLoaded.current - numberOfFormsLoaded.current);
            const numberOfMatchedPendingForms = Math.min(numberOfPendingLoadedForms.current, numberOfOpenForms);

            if (numberOfMatchedPendingForms > 0) {
              numberOfPendingLoadedForms.current -= numberOfMatchedPendingForms;
              numberOfFormsLoaded.current += numberOfMatchedPendingForms;
            }
          }

          scheduleCompletionCheck();
        },
        addLoadedForm: () => {
          if (numberOfFormsToBeLoaded.current === 0 || numberOfFormsLoaded.current >= numberOfFormsToBeLoaded.current) {
            numberOfPendingLoadedForms.current += 1;

            ensureRenderingActive();

            return;
          }

          numberOfFormsLoaded.current += 1;
          scheduleCompletionCheck();
        }
      }}>
      <></>
      {props.children}
    </FormContentLoadingContext.Provider>
  );
};
