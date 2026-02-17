import { ListItemField } from "../base/ListItemField";
import { UserFieldValue } from "../valueTypes/UserFieldValue";
import { UserFieldDescription } from "./UserFieldDescription";

export interface UserFieldProperty extends ListItemField<UserFieldDescription, UserFieldValue[]> {}
