import { FormProperty } from "../viewModels/genericForm/FormProperty";

export interface IFieldRenderer<TValue> {
  getProperty: () => FormProperty;
  render: (editMode: boolean) => JSX.Element;
  setErrorMessage: (error: string | undefined) => void;
  id: string;
}
