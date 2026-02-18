import { IPeoplePickerEntity } from "@pnp/sp/profiles";

export interface IPeoplePickerSearchApiProvider {
  searchPeople(queryString: string, includeGroups: boolean, groupId: number | undefined): Promise<IPeoplePickerEntity[]>;
}
