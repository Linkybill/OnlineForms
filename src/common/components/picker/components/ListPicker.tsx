import { ITag, TagPicker } from "@fluentui/react";
import { sp } from "@pnp/sp";
import { IListInfo } from "@pnp/sp/lists";
import log from "loglevel";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { getIWebObjectForServerRelativeUrl } from "../../../helper/SPHelper";

export const ListPicker: React.FC<{
  label: string;
  webId: string | undefined;
  serverRelativeWebUrl: string | undefined;
  selectedListIds: string[];
  allowMultipleSelections: boolean;
  disabled: boolean;
  onSelectionApproved: (selectedLists: IListInfo[]) => void;
}> = (props): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(true);
  const loadedLists = useRef<IListInfo[]>([]);
  useEffect(() => {
    const loadLists = async () => {
      log.debug("listPicker, loading lists");
      setLoading(true);
      if (props.serverRelativeWebUrl !== undefined && props.serverRelativeWebUrl !== "") {
        try {
          const web = await getIWebObjectForServerRelativeUrl(props.serverRelativeWebUrl);
          const lists = await web.lists.get();
          loadedLists.current = lists;
          setLoading(false);
        } catch (e) {
          log.error("could not load webobject by serverRelativeWebUrl in ListPicker", e);
          setLoading(false);
        }
      } else if (props.webId !== undefined) {
        const lists = await (await sp.site.openWebById(props.webId)).web.lists.get();

        loadedLists.current = lists;

        setLoading(false);
      } else {
        loadedLists.current = [];
      }
      setLoading(false);
    };
    loadLists();
  }, [props.webId, props.serverRelativeWebUrl]);

  const selectedLists = loadedLists.current.filter((list) => {
    const id = list.Id;
    return props.selectedListIds.indexOf(id) > -1;
  });
  log.debug("rendering ListPicker", {
    props: props,
    loadedLists: loadedLists.current
  });
  return (
    <>
      <label>{props.label}</label>

      <TagPicker
        onChange={(items: ITag[] | undefined) => {
          log.debug("ListPicker, onChange: ", {
            props: props,
            itemsFromEvent: items
          });
          if (items === undefined) {
            props.onSelectionApproved([]);
          } else {
            if (props.allowMultipleSelections === false && items.length > 1) {
              log.debug("webPicker, setting only last selected item");
              const selectedList = loadedLists.current.filter((list) => list.Id === items[items.length - 1].key);
              props.onSelectionApproved(selectedList);
            } else {
              const selectedItems = loadedLists.current.filter((list) => items.find((item) => item.key === list.Id) !== undefined);
              props.onSelectionApproved(selectedItems);
            }
          }
        }}
        onEmptyResolveSuggestions={() => {
          return loadedLists.current.map((list): ITag => {
            return { key: list.Id, name: list.Title };
          });
        }}
        onResolveSuggestions={(filter, selectedItems: ITag[] | undefined): ITag[] => {
          return loadedLists.current
            .filter((listInfo) => listInfo.Title.toLowerCase().indexOf(filter.toLowerCase()) > -1)
            .map((listInfo): ITag => {
              return { key: listInfo.Id, name: listInfo.Title };
            });
        }}
        {...props}
        selectedItems={selectedLists.map((list) => {
          return { key: list.Id, name: list.Title };
        })}></TagPicker>
    </>
  );
};
