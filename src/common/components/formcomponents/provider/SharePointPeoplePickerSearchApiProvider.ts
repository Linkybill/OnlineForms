import { PrincipalSource, PrincipalType, sp } from "@pnp/sp";
import { IPeoplePickerEntity } from "@pnp/sp/profiles";
import { IPeoplePickerSearchApiProvider } from "../interfaces/IPeoplePickerSearchApiProvider";

export class SharePointPeoplePickerSearchApiProvider implements IPeoplePickerSearchApiProvider {
  async searchPeople(queryString: string, includeGroups: boolean, groupId: number | undefined): Promise<IPeoplePickerEntity[]> {
    let principalType = PrincipalType.All;
    if (!includeGroups) {
      principalType = PrincipalType.User;
    }

    if (groupId !== 0) {
      principalType = PrincipalType.User | PrincipalType.SecurityGroup;
    }

    const result = await sp.profiles.clientPeoplePickerSearchUser({
      QueryString: queryString,
      MaximumEntitySuggestions: 50,
      AllowEmailAddresses: false,
      AllowOnlyEmailAddresses: false,
      PrincipalType: principalType,
      PrincipalSource: PrincipalSource.All,
      SharePointGroupID: groupId
    });

    return result;
  }
}
