import { IFieldComponentProps } from "../../base/FieldComponentProps";
import { ChoiceFieldDescription, TextKeyChoice } from "../ChoiceFieldDescription";

export interface IDropDownFieldProps extends IFieldComponentProps<ChoiceFieldDescription, string[] | TextKeyChoice[]> {}
