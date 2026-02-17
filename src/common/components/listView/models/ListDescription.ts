import { FieldDescriptionTypes } from "../../../listItem/types/FieldDescriptionTypes";

export interface ListDescription {
  viewFieldDescriptions: FieldDescriptionTypes[];
  listTitle: string;
  listId: string;
  views: string[];
  defaultView: string;
}
