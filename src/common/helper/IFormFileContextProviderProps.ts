export interface IFormFileContextProviderProps {
  listItemId: number | undefined;
  listTitle?: string;
  templateVersionIdentifier?: string;
  children?: JSX.Element | JSX.Element[] | string;
}
