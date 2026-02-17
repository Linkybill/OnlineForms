import { IFieldComponentProps } from "../../base/FieldComponentProps";
import { ChoiceFieldDescription, TextKeyChoice } from "../ChoiceFieldDescription";

export interface ICheckboxFieldProps extends IFieldComponentProps<ChoiceFieldDescription, string[] | TextKeyChoice[]> {}
