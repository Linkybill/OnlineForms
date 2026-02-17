import { IPeoplePickerEntity } from "@pnp/sp/profiles";
import log from "loglevel";
import { IPeoplePickerSearchApiProvider } from "../interfaces/IPeoplePickerSearchApiProvider";
import { IUserFieldManager } from "../interfaces/IUserFieldManager";
import { ErrorViewModel } from "../../../models/ErrorViewModel";
import { createEfav2Client } from "../../../../clients/efav2ClientCreator";
import { User } from "../../../../clients/efav2Client";

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

      // Fallback
      if (result.length === 0) {
        const userData = await this.getEfav2UserData(queryString);
        if (userData) {
          const fullName = `${userData.vorname} ${userData.nachname}`;
          result = await this.trySearch(fullName, includeGroups, groupId);
        }
      }

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
      // Fallback
      const userData = await this.getEfav2UserData(query);
      if (userData) {
        const fullName = `${userData.vorname} ${userData.nachname}`;
        return await this.searchApiProvider.searchPeople(fullName, includeGroups, groupId);
      }
      return [];
    }
  }

  private async getEfav2UserData(query: string): Promise<User | null> {
    try {
      const client = await createEfav2Client("");
      return await client.getUserData(query);
    } catch (e) {
      log.warn("EFAV2 lookup failed", e);
      return null;
    }
  }
}
