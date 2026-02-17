import { IFieldComponentProps } from "../base/FieldComponentProps";
import { UserFieldValue } from "../valueTypes/UserFieldValue";
import { UserFieldDescription } from "./UserFieldDescription";

export interface IUserFieldComponentProps extends IFieldComponentProps<UserFieldDescription, UserFieldValue[]> {}
