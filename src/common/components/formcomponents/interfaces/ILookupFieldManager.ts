import { ErrorViewModel } from "../../../models/ErrorViewModel";
import { PickerValue } from "../models/PickerValue";

export interface ILookupFieldManager {
  loadLookupSuggestions(webId: string, listId: string, fieldName: string, filter: string): Promise<ErrorViewModel<PickerValue[]>>;

  redirectToDisplayForm(lookupWebId: string, lookupListId: string, itemId: number): Promise<void>;
}
