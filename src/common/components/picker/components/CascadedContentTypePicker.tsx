import log from "loglevel";
import { ContentTypePicker } from "./ContentTypePicker";
import { ListPicker } from "./ListPicker";
import * as React from "react";
import { useState, useEffect } from "react";
import { useComponentContext } from "../../../helper/CurrentWebPartContext";
import { WebPicker } from "./WebPicker";

export const CascadedContentTypePicker: React.FC<{
  webId: string | undefined;
  listId: string | undefined;
  contentTypeId: string | undefined;
  onContentTypeSelected: (webId: string, listId: string, contentTypeId: string) => void;
}> = (props): JSX.Element => {
  const [selectedWebId, setSelectedWebId] = useState<string | undefined>(props.webId);
  const [selectedListId, setSelectedListId] = useState<string | undefined>(props.listId);
  const [selectedContentTypeId, setSelectedContentTypeId] = useState<string | undefined>(props.contentTypeId);
  log.debug("rendering cascadedContentTypePicker: ", props);

  const currentContext = useComponentContext();
  useEffect(() => {
    let webId = props.webId !== undefined ? props.webId : currentContext.context.pageContext.web.id.toString();
    setSelectedListId(props.listId);
    setSelectedWebId(webId);
    setSelectedContentTypeId(props.contentTypeId);
  }, [props.webId, props.listId, props.contentTypeId]);

  return (
    <>
      {selectedWebId !== undefined && (
        <div>
          <WebPicker
            editMode={true}
            selectedWebIds={[selectedWebId]}
            allowMultipleSelections={false}
            label="Web auswählen"
            onSelectionApproved={(webInfos) => {
              if (webInfos.length > 0) {
                setSelectedWebId(webInfos[0].Id as unknown as string);
              }
            }}></WebPicker>
          <ListPicker
            serverRelativeWebUrl={undefined}
            webId={selectedWebId}
            selectedListIds={selectedListId === undefined ? [] : [selectedListId]}
            allowMultipleSelections={false}
            disabled={selectedWebId === undefined}
            label="Liste auswählen"
            onSelectionApproved={(selectedLists) => {
              setSelectedListId((oldVal) => {
                if (selectedLists.length === 0) {
                  //props.onContentTypeSelected(selectedWebId, "", "");
                  setSelectedContentTypeId(undefined);
                  return undefined;
                } else {
                  setSelectedContentTypeId(undefined);
                  return selectedLists[0].Id;
                }
              });
            }}
          />
        </div>
      )}
      {selectedListId !== undefined && selectedWebId !== undefined && (
        <div>
          <ContentTypePicker
            webId={selectedWebId}
            listId={selectedListId}
            selectedContentTypeIds={selectedContentTypeId === undefined ? [] : [selectedContentTypeId]}
            allowMultipleSelections={false}
            disabled={selectedWebId === undefined}
            label="ContentType auswählen"
            onSelectionApproved={(selectedContentTypes) => {
              if (selectedContentTypes.length === 1) {
                setSelectedContentTypeId(selectedContentTypes[0].Id.StringValue);
                props.onContentTypeSelected(selectedWebId, selectedListId, selectedContentTypes[0].Id.StringValue);
              }
              if (selectedContentTypes.length === 0) {
                setSelectedContentTypeId(undefined);
                props.onContentTypeSelected(selectedWebId, selectedListId, "");
              }
            }}
          />
        </div>
      )}
    </>
  );
};
