import React, { useEffect, useState } from "react";
import { WebPicker } from "./WebPicker";
import { ListPicker } from "./ListPicker";
import { sp } from "@pnp/sp";
import { IFieldInfo } from "@pnp/sp/fields";
import { ActionButton, Checkbox, ChoiceGroup } from "@fluentui/react";

export const FieldPicker = (props: { onCancelClicked: () => void; onFieldsSelected: (webId: string, listId: string, fieldNames: string[]) => void; webId: string; listId: string; pickedFieldNames: string[] }) => {
  const [selectedWebId, setSelectedWebId] = useState<string>(props.webId);
  const [selectedListId, setSelectedListId] = useState<string>(props.listId);

  const [selectedFieldNames, setSelectedFieldnames] = useState<string[]>(props.pickedFieldNames);

  const [fields, setFields] = useState<IFieldInfo[]>([]);

  const loadFields = async (webId: string, listId: string) => {
    const web = await sp.site.openWebById(webId);
    const listFields = await web.web.lists.getById(listId).fields.get();
    setFields(listFields);
  };

  useEffect(() => {}, []);
  return (
    <>
      <WebPicker
        editMode={true}
        onSelectionApproved={(webInfos) => {
          setSelectedWebId(webInfos.length === 1 ? webInfos[0].Id : "");
        }}
        allowMultipleSelections={false}
        label="Web auswählen"
        selectedWebIds={selectedWebId !== "" ? [selectedWebId] : []}
      />
      <ListPicker
        serverRelativeWebUrl={undefined}
        onSelectionApproved={(listInfos) => {
          setSelectedListId(listInfos.length === 1 ? listInfos[0].Id : "");
          if (listInfos.length === 1) {
            loadFields(selectedWebId, listInfos[0].Id);
          }
        }}
        allowMultipleSelections={false}
        label="Liste auswählen"
        selectedListIds={selectedListId === "" ? [] : [selectedListId]}
        webId={selectedWebId}
        disabled={false}
      />
      {fields.map((field): JSX.Element => {
        return (
          <Checkbox
            label={field.Title}
            checked={selectedFieldNames.indexOf(field.InternalName) !== -1}
            onChange={(element, checked) => {
              setSelectedFieldnames((old) => {
                if (checked !== true) {
                  return old.filter((o) => o !== field.InternalName);
                } else {
                  return [...selectedFieldNames, field.InternalName];
                }
              });
            }}></Checkbox>
        );
      })}
      <ActionButton
        iconProps={{ iconName: "Save" }}
        text="Übernehmen"
        onClick={() => {
          props.onFieldsSelected(selectedWebId, selectedListId, selectedFieldNames);
        }}></ActionButton>
      <ActionButton
        text="Abbrechen"
        iconProps={{ iconName: "Cancel" }}
        onClick={() => {
          props.onCancelClicked();
        }}></ActionButton>
    </>
  );
};
