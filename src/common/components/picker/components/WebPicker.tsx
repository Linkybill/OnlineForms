import { IBasePickerProps, ITag, MessageBar, MessageBarType, TagPicker } from "@fluentui/react";
import { sp } from "@pnp/sp";
import { IWebInfo } from "@pnp/sp/webs";
import log from "loglevel";
import * as React from "react";
import { useEffect, useRef, useState } from "react";

export interface IWebPickerProps extends IBasePickerProps<IWebInfo> {}
export const WebPicker: React.FC<{
  editMode?: boolean;
  label: string;
  selectedWebIds: string[];
  allowMultipleSelections: boolean;
  onSelectionApproved: (selectedWebs: IWebInfo[]) => void;
}> = (props): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(true);
  const loadedWebs = useRef<IWebInfo[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  useEffect(() => {
    const loadWebs = async () => {
      try {
        const webs = sp.site.rootWeb.getSubwebsFilteredForCurrentUser().get();
        const rootWeb = (await sp.site.getRootWeb()).get();
        const [resolvedWebs, resolvedRootWeb] = await Promise.all([webs, rootWeb]);
        loadedWebs.current = [resolvedRootWeb, ...resolvedWebs];
        log.debug("webpicker: loaded webs", webs);
        setLoading(false);
      } catch (e) {
        log.error("webPicker could not load webs", e);
        setError("Webs konnten nicht geladen werden");
        setLoading(false);
      }
    };
    loadWebs();
  }, []);

  const selectedItems = loadedWebs.current
    .filter((web) => props.selectedWebIds.indexOf(web.Id as unknown as string) > -1)
    .map((web): ITag => {
      return {
        key: web.Id,
        name: web.Title
      };
    });
  log.debug("rendering webPicker", {
    props: props,
    loadedWeb: loadedWebs.current,
    selectedItems: selectedItems
  });

  return (
    <>
      <label>{props.label}</label>
      {error !== undefined && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}
      <TagPicker
        disabled={!props.editMode}
        selectionAriaLabel="Auswahl:"
        onChange={(items: ITag[] | undefined) => {
          log.debug("webPicker, onChange: ", {
            props: props,
            itemsFromEvent: items
          });
          if (items === undefined) {
            props.onSelectionApproved([]);
          } else {
            if (props.allowMultipleSelections === false && items.length > 1) {
              log.debug("webPicker, setting only first selected item");
              const selectedWebs = loadedWebs.current.filter((web) => (web.Id as unknown as string) === items[items.length - 1].key);
              props.onSelectionApproved(selectedWebs);
            } else {
              log.debug("setting selected items to ", items);
              const selectedwebs = loadedWebs.current.filter((web) => items.findIndex((item) => item.key === (web.Id as unknown as string)) > -1);
              props.onSelectionApproved(selectedwebs);
            }
          }
        }}
        selectedItems={selectedItems}
        onEmptyResolveSuggestions={() => {
          return loadedWebs.current.map((web): ITag => {
            return { key: web.Id as unknown as string, name: web.Title };
          });
        }}
        onResolveSuggestions={(filter, selectedItems: ITag[] | undefined): ITag[] => {
          return loadedWebs.current
            .filter((web) => web.Title.toLowerCase().indexOf(filter.toLowerCase()) > -1)
            .map((web): ITag => {
              return { key: web.Id as unknown as string, name: web.Title };
            });
        }}></TagPicker>
    </>
  );
};
