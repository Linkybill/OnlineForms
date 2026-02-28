import { sp } from "@pnp/sp";
import React, { useContext, useEffect, useState } from "react";
import { PermissionKind } from "@pnp/sp/security";
import log from "loglevel";
import { FormContentService } from "../services/FormContentService";

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
export const PermissionContextProvider = (props: {
  listItemId: undefined | number;
  listTitle?: string;
  templateVersionIdentifier?: string;
  children: JSX.Element;
}): JSX.Element => {
  const [currentUserCanWrite, setCurrentUserCanWrite] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    const loadPermissions = async () => {
      const params = new URLSearchParams(window.location.search);
      const isReadOnlyInUrl = params.get("readonly") === "1";
      if (isReadOnlyInUrl == true) {
        setCurrentUserCanWrite(false);
      } else {
        try {
          let listTitleToUse = props.listTitle;
          const service = new FormContentService();
          if (!listTitleToUse && props.listItemId !== undefined) {
            listTitleToUse = await service.resolveInstanceListNameByItemId(props.listItemId);
          }
          if (!listTitleToUse && props.templateVersionIdentifier) {
            listTitleToUse = await service.resolveInstanceListNameByTemplateIdentifier(props.templateVersionIdentifier);
          }

          if (!listTitleToUse) {
            log.warn("could not resolve list title for permission check");
            setCurrentUserCanWrite(false);
            return;
          }

          if (props.listItemId === undefined) {
            const currentUserCanWrite = await sp.web.lists.getByTitle(listTitleToUse).currentUserHasPermissions(PermissionKind.AddListItems);
            log.debug("current user has write permissions", currentUserCanWrite);
            setCurrentUserCanWrite(currentUserCanWrite);
          } else {
            const permissions = await sp.web.lists.getByTitle(listTitleToUse).items.getById(props.listItemId).effectiveBasePermissions.get();
            const hasEditPermission = sp.web.lists.getByTitle(listTitleToUse).items.getById(props.listItemId).hasPermissions(permissions, PermissionKind.EditListItems);
            log.debug("current user has write permissions", hasEditPermission);
            setCurrentUserCanWrite(hasEditPermission);
          }
        } catch (e) {
          log.error("could not load permissions", e);
          setCurrentUserCanWrite(false);
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
