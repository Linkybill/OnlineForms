import { IPeoplePickerEntity } from "@pnp/sp/profiles";
import log from "loglevel";
import { IPeoplePickerSearchApiProvider } from "../interfaces/IPeoplePickerSearchApiProvider";
import { IUserFieldManager } from "../interfaces/IUserFieldManager";
import { ErrorViewModel } from "../../../models/ErrorViewModel";

export class UserFieldManager implements IUserFieldManager {
  private readonly searchApiProvider: IPeoplePickerSearchApiProvider;
  public constructor(provider: IPeoplePickerSearchApiProvider) {
    this.searchApiProvider = provider;
  }

  async searchPeople(queryString: string, includeGroups: boolean, groupId?: number): Promise<ErrorViewModel<IPeoplePickerEntity[]>> {
    try {
      log.debug("Searching people", queryString);

      // Search
      let result = await this.trySearch(queryString, includeGroups, groupId);

      return { error: undefined, model: result };
    } catch (e) {
      log.error("Could not search for people", e);
      return { error: "Benutzer konnten nicht geladen werden", model: [] };
    }
  }

  private async trySearch(query: string, includeGroups: boolean, groupId?: number): Promise<IPeoplePickerEntity[]> {
    try {
      return await this.searchApiProvider.searchPeople(query, includeGroups, groupId);
    } catch (e) {
      return [];
    }
  }
}
