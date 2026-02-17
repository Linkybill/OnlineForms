import { ListItem } from "../../../../listItem/ListItem";
import { FieldDescriptionTypes } from "../../../../listItem/types/FieldDescriptionTypes";
import { FieldValueTypes } from "../../../../listItem/types/FieldValueTypes";

export interface IGenericFormProps {
  value: ListItem;
  onSubmit: (valueToSubmit: ListItem) => void;
  editMode: boolean;
  onValueChanged: (fieldDescription: FieldDescriptionTypes, changedValue: FieldValueTypes) => void;
  showSaveButton?: boolean;
  onCloseClicked?: () => void;
  showIdProperty?: boolean;
}
