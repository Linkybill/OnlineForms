import log from "loglevel";
import { GenericForm } from "./genericForm/GenericForm";
import * as React from "react";
import { ListItem } from "../../../listItem/ListItem";
import { FieldDescriptionTypes } from "../../../listItem/types/FieldDescriptionTypes";
import { FieldValueTypes } from "../../../listItem/types/FieldValueTypes";

export const SchemaForm: React.FC<{
  onCloseClicked?: () => void;
  value: ListItem;
  editMode: boolean;
  onSubmit: (value: ListItem) => void;
  onValueChanged: (fieldDescription: FieldDescriptionTypes, changedValue: FieldValueTypes) => void;
  showSaveButton?: boolean;
}> = (props): JSX.Element => {
  return (
    <GenericForm
      onCloseClicked={props.onCloseClicked}
      editMode={props.editMode}
      onSubmit={(value) => {
        log.debug("SchemaForm: submitting item: ", value);
        props.onSubmit(value);
      }}
      onValueChanged={(description, value) => {
        log.debug("generic form, value changed", description, value);
        props.onValueChanged(description, value);
      }}
      value={props.value}
      showSaveButton={props.showSaveButton}></GenericForm>
  );
};
