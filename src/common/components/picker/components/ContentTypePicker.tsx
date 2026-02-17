import { ITag, TagPicker } from "@fluentui/react";
import { sp } from "@pnp/sp";
import { IContentTypeInfo } from "@pnp/sp/content-types";
import log from "loglevel";
import * as React from "react";
import { useEffect, useRef, useState } from "react";

export const ContentTypePicker: React.FC<{
  label: string;
  webId: string | undefined;
  listId: string | undefined;
  selectedContentTypeIds: string[];
  allowMultipleSelections: boolean;
  disabled: boolean;
  onSelectionApproved: (selectedContentTypeIds: IContentTypeInfo[]) => void;
}> = (props): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(true);
  const loadedContentTypes = useRef<IContentTypeInfo[]>([]);
  useEffect(() => {
    const loadLists = async () => {
      log.debug("contentTypePicker, loading lists");
      setLoading(true);
      if (props.webId !== undefined && props.listId !== undefined) {
        const cTypes = await (await sp.site.openWebById(props.webId)).web.lists.getById(props.listId).contentTypes.get();

        loadedContentTypes.current = cTypes;
        setLoading(false);
      } else {
        loadedContentTypes.current = [];
      }
      setLoading(false);
    };
    loadLists();
  }, [props.webId, props.listId]);

  log.debug("rendering ContenttypePickerField", {
    props: props
  });

  const selectedItems = loadedContentTypes.current
    .filter((contenttype) => props.selectedContentTypeIds.includes(contenttype.Id.StringValue))
    .map((ctype): ITag => {
      return { key: ctype.Id.StringValue, name: ctype.Name };
    });
  return (
    <>
      <label>{props.label}</label>

      <TagPicker
        onChange={(items: ITag[] | undefined) => {
          log.debug("contentTypePicker, onChange: ", {
            props: props,
            itemsFromEvent: items
          });
          if (items === undefined) {
            props.onSelectionApproved([]);
          } else {
            if (props.allowMultipleSelections === false && items.length > 1) {
              log.debug("webPicker, setting only last selected item");
              const selectedCTypes = loadedContentTypes.current.filter((cType) => cType.Id.StringValue === items[items.length - 1].key);
              props.onSelectionApproved(selectedCTypes);
            } else {
              const selectedItems = loadedContentTypes.current.filter((cType) => items.find((item) => item.key === cType.Id.StringValue) !== undefined);
              props.onSelectionApproved(selectedItems);
            }
          }
        }}
        onEmptyResolveSuggestions={() => {
          return loadedContentTypes.current.map((cType): ITag => {
            return { key: cType.Id.StringValue, name: cType.Name };
          });
        }}
        onResolveSuggestions={(filter, selectedItems: ITag[] | undefined): ITag[] => {
          return loadedContentTypes.current
            .filter((cType) => cType.Name.toLowerCase().indexOf(filter.toLowerCase()) > -1)
            .map((cType): ITag => {
              return { key: cType.Id.StringValue, name: cType.Name };
            });
        }}
        selectedItems={selectedItems}
        {...props}></TagPicker>
    </>
  );
};
