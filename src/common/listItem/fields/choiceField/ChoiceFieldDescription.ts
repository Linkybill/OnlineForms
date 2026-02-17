import { FieldDescription } from "../base/FieldDescription";

export interface TextKeyChoice {
  text: string;
  key: string;
  data?: any;
}

export interface ChoiceFieldDescription extends FieldDescription<string[]> {
  fillInChoiceEnabled: boolean;
  choices: string[];
  formulaForChoices: string;
  fieldValueIsOfTypeTextKeyArray?: boolean;
  textKeyChoices?: TextKeyChoice[];
  enableMultipleSelections: boolean;
  representation?: "Dropdown" | "Checkbox / Radio";
}
