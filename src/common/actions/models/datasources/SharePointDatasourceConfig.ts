export interface SharePointDatasourceConfig {
  serverRelativeWebUrl: string;
  listName: string;
  searchListInCurrentWeb: boolean | null | undefined;
}
