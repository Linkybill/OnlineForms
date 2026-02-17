import { IFieldComponentProps } from "../../base/FieldComponentProps";
import { ChoiceFieldDescription, TextKeyChoice } from "../ChoiceFieldDescription";

export interface IRadioFieldProps extends IFieldComponentProps<ChoiceFieldDescription, string[] | TextKeyChoice[]> {}
