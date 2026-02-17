import { CreateOption } from "../models/CreateOption";
import { ListDescription } from "../models/ListDescription";
import { PagedResult } from "../models/PagedResult";

export interface ListViewModel {
  listDescription: ListDescription;
  loadedData: PagedResult;
  createOptions: CreateOption[];
}
