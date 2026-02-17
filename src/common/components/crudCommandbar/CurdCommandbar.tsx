import { CommandBar, ICommandBarItemProps, IContextualMenuProps } from "@fluentui/react";
import log from "loglevel";
import React from "react";

export const CrudCommandbar = (props: {
  subMenuesForAdd?: IContextualMenuProps;
  onAddClicked: () => void;
  onDeleteClicked: () => void;
  onEditClicked: () => void;
  canDelete: boolean;
  canEdit: boolean;
  canAdd: boolean;
  addLabelText?: string;
  deleteLabelText?: string;
  editLabelText?: string;
  additionalCommands?: ICommandBarItemProps[];
}): JSX.Element => {
  log.debug("rendering crudCommandbar with ", props);
  const additionalCommands: ICommandBarItemProps[] = props.additionalCommands ? props.additionalCommands : [];
  return (
    <CommandBar
      items={[
        {
          text: props.addLabelText ? props.addLabelText : "Hinzufügen",
          key: "add",
          disabled: props.canAdd === false,
          iconProps: { iconName: "Add" },
          onClick: props.onAddClicked,
          subMenuProps: props.subMenuesForAdd
        },
        {
          text: props.editLabelText ? props.editLabelText : "Bearbeiten",
          key: "edit",
          disabled: props.canEdit === false,
          iconProps: { iconName: "Edit" },
          onClick: props.onEditClicked
        },
        {
          text: props.deleteLabelText ? props.deleteLabelText : "Löschen",
          key: "delete",
          disabled: props.canDelete === false,
          iconProps: { iconName: "Delete" },
          onClick: props.onDeleteClicked
        },
        ...additionalCommands
      ]}></CommandBar>
  );
};
