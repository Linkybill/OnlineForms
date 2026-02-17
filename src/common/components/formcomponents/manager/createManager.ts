import { ILookupFieldManager } from "../interfaces/ILookupFieldManager";
import { LookupFieldManager } from "./LookupFieldManager";
import { SharePointLookupFieldProvider } from "../provider/SharePointLookupFieldProvider";
import { IUserFieldManager } from "../interfaces/IUserFieldManager";
import { UserFieldManager } from "./UserFieldManager";
import { SharePointPeoplePickerSearchApiProvider } from "../provider/SharePointPeoplePickerSearchApiProvider";
import { IGenericListManager } from "../interfaces/IGenericListManager";
import { GenericListManager } from "./GenericListManager";

export const managerFactory = {
  createLookupFieldManager: (): ILookupFieldManager => {
    return new LookupFieldManager(new SharePointLookupFieldProvider());
  },
  createUserFieldManager: (): IUserFieldManager => {
    return new UserFieldManager(new SharePointPeoplePickerSearchApiProvider());
  },

  createGenericListViewManager: (): IGenericListManager => {
    return new GenericListManager();
  }
};
