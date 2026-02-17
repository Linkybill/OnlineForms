import React, { useState } from "react";
import { ListPicker } from "../../../picker/components/ListPicker";
import { WebPicker } from "../../../picker/components/WebPicker";
import { sp } from "@pnp/sp";
import { OkAndCancelButton } from "../../../okAndCancelButton/OkAndCancelButton";

export const AddFieldInSharePointLink = (props: { onCancelClicked: () => void }) => {
  const [webId, setWebId] = useState<string | undefined>(undefined);
  const [listId, setListId] = useState<string | undefined>(undefined);
  return (
    <>
      <WebPicker
        editMode={true}
        selectedWebIds={webId === undefined ? [] : [webId]}
        allowMultipleSelections={false}
        label="Web auswählen"
        onSelectionApproved={(selectedWebs) => {
          setWebId(() => {
            return selectedWebs.length == 0 ? undefined : selectedWebs[0].Id;
          });
        }}></WebPicker>
      <ListPicker
        serverRelativeWebUrl={undefined}
        selectedListIds={listId === undefined ? [] : [listId]}
        onSelectionApproved={async (selectedLists) => {
          setListId(() => {
            return selectedLists.length === 0 ? undefined : selectedLists[0].Id;
          });
          if (selectedLists.length > 0) {
            const web = await sp.site.openWebById(webId);
            const webInfo = await web.web.get();
            const url = webInfo.Url + "/_layouts/15/fldNew.aspx?List={" + selectedLists[0].Id + "}";
            window.open(url, "_blank").focus();
          }
        }}
        allowMultipleSelections={false}
        disabled={false}
        label="Liste auswählen"
        webId={webId}
      />
      <OkAndCancelButton cancelButtonText="Abbrechen" okButtonIconName="" okButtonText="" onCancelClicked={props.onCancelClicked} showOkButton={false} showCancelButton={true} />
    </>
  );
};
