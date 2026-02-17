import { sp } from "@pnp/sp";
import React, { useContext, useEffect, useState } from "react";
import { ListNames } from "../../extensions/formTemplateListActions/Constants";
import { PermissionKind } from "@pnp/sp/security";
import log from "loglevel";

export interface PermissionInfos {
  currentUserCanWrite: () => boolean;
  setCurrentUserCanWrite: (canWrite: boolean) => void;
}

const PermissionContext = React.createContext<PermissionInfos>({
  currentUserCanWrite: () => {
    throw new Error("method CurrentUserCanWrite is not implemented in PermissionContext");
  },
  setCurrentUserCanWrite: () => {
    throw new Error("setCurrentUserCanWrite is not implemented in PermissionContextProvider");
  }
});

export const usePermissionContext = () => useContext(PermissionContext);
export const PermissionContextProvider = (props: { listItemId: undefined | number; children: JSX.Element }): JSX.Element => {
  const [currentUserCanWrite, setCurrentUserCanWrite] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    const loadPermissions = async () => {
      const params = new URLSearchParams(window.location.search);
      const isReadOnlyInUrl = params.get("readonly") === "1";
      if (isReadOnlyInUrl == true) {
        setCurrentUserCanWrite(false);
      } else {
        if (props.listItemId === undefined) {
          const currentUserCanWrite = await sp.web.lists.getByTitle(ListNames.aktiveFormsListName).currentUserHasPermissions(PermissionKind.AddListItems);
          log.debug("current user has write permissions", currentUserCanWrite);
          setCurrentUserCanWrite(currentUserCanWrite);
        } else {
          try {
            const permissions = await sp.web.lists.getByTitle(ListNames.aktiveFormsListName).items.getById(props.listItemId).effectiveBasePermissions.get();
            const hasEditPermission = sp.web.lists.getByTitle(ListNames.aktiveFormsListName).items.getById(props.listItemId).hasPermissions(permissions, PermissionKind.EditListItems);
            log.debug("current user has write permissions", currentUserCanWrite);
            setCurrentUserCanWrite(hasEditPermission);
          } catch (e) {
            log.error("could not load permissions", e);
            setCurrentUserCanWrite(false);
          }
        }
      }
    };
    loadPermissions();
  }, []);

  return (
    <>
      {currentUserCanWrite !== undefined && (
        <PermissionContext.Provider
          value={{
            currentUserCanWrite: () => {
              return currentUserCanWrite;
            },
            setCurrentUserCanWrite: setCurrentUserCanWrite
          }}>
          {props.children}
        </PermissionContext.Provider>
      )}
    </>
  );
};
