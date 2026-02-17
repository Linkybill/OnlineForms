import { SPHttpClient } from "@microsoft/sp-http";
import * as log from "loglevel";
import * as React from "react";

const FieldsAreLockedInfoContext = React.createContext<{ fieldsAreLocked: boolean }>({ fieldsAreLocked: false });

export const useFieldsAreLockedInfoContext = () => React.useContext(FieldsAreLockedInfoContext);

export const FieldsAreLockedContextProvider: React.FC<{ children?: string | JSX.Element | JSX.Element[]; locked: boolean }> = (props) => {
  return (
    <FieldsAreLockedInfoContext.Provider
      value={{
        fieldsAreLocked: props.locked
      }}>
      {props.children}
    </FieldsAreLockedInfoContext.Provider>
  );
};
