import { useState } from "react";
import { ActionButton, IconButton, Label, TextField } from "@fluentui/react";
import log from "loglevel";
import * as React from "react";
import { IFieldComponentProps } from "../base/FieldComponentProps";
import { ListPickerFieldDescription } from "./ListPickerFieldDescription";
import { ListPicker } from "../../../components/picker/components/ListPicker";
import { useListItemContext } from "../../../helper/ListItemContext";

export interface IListPickerFieldProps extends IFieldComponentProps<ListPickerFieldDescription, string | undefined> {}

export const ListPickerField = (props: IListPickerFieldProps): JSX.Element => {
  const itemContext = useListItemContext();
  const propertyForWeb: string =
    props.fieldDescription.webId !== undefined
      ? props.fieldDescription.webId
      : itemContext.getProperty(props.fieldDescription.propertyNameForWebIdFromItemContext) !== undefined
      ? (itemContext.getProperty(props.fieldDescription.propertyNameForWebIdFromItemContext).value as string)
      : "";
  log.debug("rendering listpickerfield", {
    props: props,
    propertyForWeb: propertyForWeb,
    itemContext: itemContext,
    itemFromItemContext: itemContext.getListItem()
  });
  return (
    <>
      <ListPicker
        disabled={!props.editMode}
        webId={propertyForWeb !== undefined ? propertyForWeb : undefined}
        serverRelativeWebUrl={props.fieldDescription.serverRelativeWebUrl}
        onSelectionApproved={(selectedLists) => {
          log.debug("ListPicker, callingOnValueChanged", {
            fieldDescription: props.fieldDescription,
            selectedLists: selectedLists
          });
          props.onValueChanged(props.fieldDescription, selectedLists[0].Id);
        }}
        allowMultipleSelections={false}
        label={props.fieldDescription.displayName}
        selectedListIds={props.fieldValue !== undefined && props.fieldValue.length > 0 ? [props.fieldValue] : []}></ListPicker>
    </>
  );
};
