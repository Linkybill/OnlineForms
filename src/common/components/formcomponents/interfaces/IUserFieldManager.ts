import { IPeoplePickerEntity } from "@pnp/sp/profiles";
import { ErrorViewModel } from "../../../models/ErrorViewModel";

export interface IUserFieldManager {
  searchPeople(queryString: string, includeGroups: boolean, groupId: number | undefined): Promise<ErrorViewModel<IPeoplePickerEntity[]>>;
}
