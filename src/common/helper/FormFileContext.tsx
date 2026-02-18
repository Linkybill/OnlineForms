import { useContext } from "react";
import * as React from "react";
import { IFormFileContextProviderProps } from "./IFormFileContextProviderProps";
import { sp } from "@pnp/sp";
import log from "loglevel";
import { Guid } from "@microsoft/sp-core-library";
import { FormContentService } from "../services/FormContentService";

// todo: Seperate context into ListItemContext, ParameterContext and ConditionContext, where COnditionContext has access to ListItemContext and ParameterContext
export interface FileWithKey {
  key: string;
  file: File;
}
export interface IFormFileContextAccessor {
  filesBeingUploaded: () => FileWithKey[];
  openFile: (fileName: string) => void;
  resetFilesBeingUploaded: () => void;

  addFilesBeingUploaded: (key: string, files: File[]) => void;
  addFileBeingDeleted: (fileName: string) => void;
  uploadOrDeleteFiles: () => Promise<void>;
  filenamesBeingDeleted: () => string[];
}

const FormFileContext = React.createContext<IFormFileContextAccessor | undefined>({
  filesBeingUploaded: () => [],
  addFilesBeingUploaded: function (key: string, files: File[]): void {
    throw new Error("Function not implemented.");
  },
  openFile: function (fileName: string): void {
    throw new Error("Function not implemented.");
  },
  resetFilesBeingUploaded: function (): void {
    throw new Error("Function not implemented.");
  },
  addFileBeingDeleted: function (fileName: string): void {
    throw new Error("Function not implemented.");
  },
  uploadOrDeleteFiles: function (): Promise<void> {
    throw new Error("Function not implemented.");
  },
  filenamesBeingDeleted: function (): string[] {
    return [];
  }
});

export const useFormFileContext = () => useContext(FormFileContext);

export const FormFileContextProvider: React.FC<IFormFileContextProviderProps> = (props): JSX.Element => {
  const currentPath = React.useRef<string | undefined>(undefined);
  const filesBeingUploaded = React.useRef<FileWithKey[]>([]);
  const filenamesBeingDeleted = React.useRef<string[]>([]);
  const id = React.useRef(Guid.newGuid());

  const encodeUrl = (url: string): string => {
    const encodedUrl = url
      .split("/") // Aufteilen an den Schrägstrichen
      .map(
        (segment) => encodeURIComponent(segment) // Jedes Segment kodieren
      )
      .join("/"); // Zusammenfügen der Segmente mit Schrägstrichen

    // Ersetzt spezifische Zeichen nach der Kodierung
    return encodedUrl;
  };

  const openFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const newWindow = window.open();
      const contentType = file.type;
      const dataUrl = e.target.result;

      // Unterscheidung der Darstellung nach Dateityp
      if (contentType.startsWith("image/")) {
        newWindow.document.write('<img src="' + dataUrl + '" alt="Image">');
      } else if (contentType === "application/pdf") {
        newWindow.document.write('<iframe width="100%" height="100%" src="' + dataUrl + '"></iframe>');
      } else {
        newWindow.document.write('<iframe width="100%" height="100%" src="' + dataUrl + '"></iframe>');
      }
    };
    reader.readAsDataURL(file);
  };

  React.useEffect(() => {
    const loadItem = async (itemId: number) => {
      const service = new FormContentService();
      let listTitleToUse = props.listTitle;
      if (!listTitleToUse) {
        listTitleToUse = await service.resolveInstanceListNameByItemId(itemId);
      }
      if (!listTitleToUse && props.templateVersionIdentifier) {
        listTitleToUse = await service.resolveInstanceListNameByVersion(props.templateVersionIdentifier);
      }
      if (!listTitleToUse) {
        log.warn("could not resolve list title for file context");
        return;
      }
      const item = await sp.web.lists.getByTitle(listTitleToUse).items.getById(itemId).select("FileRef").get();
      currentPath.current = item.FileRef;
    };
    if (props.listItemId !== undefined) {
      loadItem(props.listItemId);
    }
  }, [props.listItemId, props.listTitle, props.templateVersionIdentifier]);
  const addFileBeingUploaded = (key: string, file: File) => {
    filesBeingUploaded.current = [...filesBeingUploaded.current.filter((f) => f.file.name !== file.name), { key: key, file: file }];
    filenamesBeingDeleted.current = filenamesBeingDeleted.current.filter((fileName) => fileName !== file.name);
  };

  const addFileBeingDeleted = (fileName: string) => {
    filenamesBeingDeleted.current = [...filenamesBeingDeleted.current.filter((f) => f !== fileName), fileName];
    filesBeingUploaded.current = filesBeingUploaded.current.filter((f) => f.file.name !== fileName);
  };

  const provider: IFormFileContextAccessor = {
    filenamesBeingDeleted: () => {
      return filenamesBeingDeleted.current;
    },
    openFile: (fileName: string) => {
      const filteredFiles = filesBeingUploaded.current.filter((f) => f.file.name === fileName);
      const fileIsBeingUploaed = filteredFiles.length > 0;
      if (fileIsBeingUploaed === false) {
        const urlToUse = encodeUrl(currentPath.current + "/" + fileName);
        const link = document.createElement("a");
        link.href = urlToUse;
        link.target = "_blank";
        link.click();
      } else {
        openFile(filteredFiles[0].file);
      }
    },
    filesBeingUploaded: () => {
      log.debug(id.current);
      return filesBeingUploaded.current;
    },
    addFileBeingDeleted: (fileName: string) => {
      addFileBeingDeleted(fileName);
    },
    addFilesBeingUploaded: function (key: string, files: File[]): void {
      log.debug(id.current);
      files.forEach((f) => {
        addFileBeingUploaded(key, f);
      });
    },

    resetFilesBeingUploaded: function (): void {
      filesBeingUploaded.current = [];
    },
    uploadOrDeleteFiles: function (): Promise<void> {
      return Promise.resolve();
    }
  };
  return <FormFileContext.Provider value={provider}>{props.children}</FormFileContext.Provider>;
};

export const FormFileContextConsumer: React.FC<{
  children: (formFileContext: IFormFileContextAccessor) => JSX.Element;
}> = (props): JSX.Element => {
  return <FormFileContext.Consumer>{(formContextAccessor) => <>{props.children(formContextAccessor)}</>}</FormFileContext.Consumer>;
};
