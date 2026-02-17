export interface IFormManager {
  jsxElementsGroupedByFieldName: { [name: string]: JSX.Element };
  submit: () => void;
}
