export interface ILookupFieldProvider {
  loadLookupValues(webId: string, listId: string, lookupFieldName: string, filterValue: string): Promise<any[]>;

  loadDisplayFormUrl(webId: string, listId: string, itemId: number): Promise<string>;
}
