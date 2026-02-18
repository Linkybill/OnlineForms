import * as React from "react";
import { IFormTemplateEditorWebPartProps } from "./IFormTemplateEditorWebPartProps";
import { ServerLoggingContext, ServerLoggingContextProvider } from "../../../common/logging/ServerLoggingContext";
import { FormTemplateEditorWebPart } from "./FormTemplateEditorWebPart";

export const RemoteLoggingContextWithFormTemplateEditorWebPart = (props: IFormTemplateEditorWebPartProps): JSX.Element => {
  return (
    <ServerLoggingContextProvider>
      <>
        <FormTemplateEditorWebPart {...props} />
      </>
    </ServerLoggingContextProvider>
  );
};
