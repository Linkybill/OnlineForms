import React, { useEffect, useState } from "react";
import { SharePointDatasourceConfig } from "../../models/datasources/SharePointDatasourceConfig";
import { sp } from "@pnp/sp";
import { FieldTypeNames } from "../../../listItem/FieldTypeNames";
import { ListPickerField } from "../../../listItem/fields/ListPickerField.tsx/ListPickerField";
import { WebPickerField } from "../../../listItem/fields/webPickerField/WebPickerField";
import { getIWebObjectForServerRelativeUrl } from "../../../helper/SPHelper";
import { TextField, Toggle } from "@fluentui/react";
import log from "loglevel";

export const SharePointDatasourceConfigEditor = (props: { sharePointDatasourceConfig: SharePointDatasourceConfig; onConfigChanged: (newConfig: SharePointDatasourceConfig) => void }): JSX.Element => {
  const [webId, setWebId] = useState<string>("");
  const [listId, setListId] = useState<string>("");
  const [serverRelativeUrl, setServerRelativeUrl] = useState<string>(props.sharePointDatasourceConfig.serverRelativeWebUrl);
  useEffect(() => {
    const loadDefaultViewName = async () => {
      try {
        setServerRelativeUrl(props.sharePointDatasourceConfig.serverRelativeWebUrl);
        const web = await getIWebObjectForServerRelativeUrl(props.sharePointDatasourceConfig.serverRelativeWebUrl);
        const resolvedWeb = await web.get();
        setWebId(resolvedWeb.Id);
        if (props.sharePointDatasourceConfig.listName !== "") {
          try {
            const resolvedList = await web.lists.getByTitle(props.sharePointDatasourceConfig.listName).get();
            setListId(resolvedList.Id);
          } catch (e) {
            setListId("");
          }
        }
      } catch (e) {
        log.error("web konnte nicht gesetzt werden im SharePointDatasourceConfigEditor");
      }
    };
    loadDefaultViewName();
  }, [props.sharePointDatasourceConfig.serverRelativeWebUrl, props.sharePointDatasourceConfig.listName]);
  return (
    <>
      <Toggle
        checked={props.sharePointDatasourceConfig.searchListInCurrentWeb}
        onChange={(ev, val) => {
          const newConfig: SharePointDatasourceConfig = { ...props.sharePointDatasourceConfig, listName: val !== true ? "" : props.sharePointDatasourceConfig.listName, searchListInCurrentWeb: val };
          props.onConfigChanged(newConfig);
        }}
        label="Liste immer aus dem aktuellen Web erwarten?"></Toggle>
      {props.sharePointDatasourceConfig.searchListInCurrentWeb === true && (
        <>
          <TextField
            value={props.sharePointDatasourceConfig.listName}
            label="Listenname aus dem aktuellen Web"
            onChange={(ev, val) => {
              const newConfig: SharePointDatasourceConfig = { ...props.sharePointDatasourceConfig, listName: val };
              props.onConfigChanged(newConfig);
            }}></TextField>
        </>
      )}
      {props.sharePointDatasourceConfig.searchListInCurrentWeb !== true && (
        <>
          <WebPickerField
            onBlur={() => {}}
            rawData={""}
            validationErrors={[]}
            renderAsTextOnly={false}
            onValueChanged={async (field, value) => {
              const newConfig = { ...props.sharePointDatasourceConfig };
              const web = await sp.site.openWebById(value);
              const resolvedWeb = await web.web.get();

              newConfig.serverRelativeWebUrl = resolvedWeb.ServerRelativeUrl;
              props.onConfigChanged(newConfig);
            }}
            fieldValue={webId}
            editMode={true}
            fieldDescription={{
              defaultValue: "",
              description: "web auswählen",
              displayName: "web",
              internalName: "webId",
              required: true,
              type: FieldTypeNames.WebPicker,
              uniqueKey: "SharePointDatasourceWebPicker",
              isReadOnly: false
            }}></WebPickerField>
          <TextField
            label="ServerRelative Url"
            value={serverRelativeUrl}
            onChange={(ev, v) => {
              setServerRelativeUrl(v);
            }}
            onBlur={() => {
              const newConfig = { ...props.sharePointDatasourceConfig };
              newConfig.serverRelativeWebUrl = serverRelativeUrl;
              props.onConfigChanged(newConfig);
            }}></TextField>
          <ListPickerField
            onBlur={() => {}}
            validationErrors={[]}
            editMode={true}
            fieldDescription={{
              defaultValue: "",
              description: "Liste auswählen",
              displayName: "SharePointListe",
              internalName: "listId",
              required: true,
              type: FieldTypeNames.ListPicker,
              uniqueKey: "SharePiontDatasourceListPicker",
              serverRelativeWebUrl: props.sharePointDatasourceConfig.serverRelativeWebUrl
            }}
            fieldValue={listId}
            rawData={""}
            onValueChanged={async (field, value) => {
              const newConfig = { ...props.sharePointDatasourceConfig };
              const webObject = await getIWebObjectForServerRelativeUrl(props.sharePointDatasourceConfig.serverRelativeWebUrl);
              const resolvedList = await webObject.lists.getById(value).get();
              newConfig.listName = resolvedList.Title;
              props.onConfigChanged(newConfig);
            }}
            renderAsTextOnly={false}></ListPickerField>
        </>
      )}
      <></>
    </>
  );
};
