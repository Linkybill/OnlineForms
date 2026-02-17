import log from "loglevel";
import { ILookupFieldManager } from "../interfaces/ILookupFieldManager";
import { ILookupFieldProvider } from "../interfaces/ILookupFieldProvider";
import { PickerValue } from "../models/PickerValue";
import { ErrorViewModel } from "../../../models/ErrorViewModel";

export class LookupFieldManager implements ILookupFieldManager {
  private provider: ILookupFieldProvider;
  public constructor(provider: ILookupFieldProvider) {
    this.provider = provider;
  }
  async redirectToDisplayForm(lookupWebId: string, lookupListId: string, itemId: number): Promise<void> {
    try {
      const redirectUrl = await this.provider.loadDisplayFormUrl(lookupWebId, lookupListId, itemId);
      window.location.href = redirectUrl;
    } catch (e) {
      log.error(
        "could not redirect to ",
        {
          lookupWebId: lookupWebId,
          lookupListId: lookupListId,
          itemId: itemId
        },
        e
      );
    }
  }
  async loadLookupSuggestions(webId: string, listId: string, fieldName: string, filter: string): Promise<ErrorViewModel<PickerValue[]>> {
    try {
      const lookupItems = await this.provider.loadLookupValues(webId, listId, fieldName, filter);

      const result: PickerValue[] = lookupItems.map((item: any): PickerValue => {
        return {
          id: item.ID,
          value: item[fieldName]
        };
      });
      log.debug("loaded lookup values", result);
      return {
        error: undefined,
        model: result
      };
    } catch (e) {
      log.error("could not load lookup suggestions.", e);
      return Promise.resolve<ErrorViewModel<PickerValue[]>>({
        error: "Lookup Values konnten nicht geladen werden",
        model: []
      });
    }
  }
}
