import { ComponentConfig } from "../../components/componentProxy/models/componentConfig";

export interface FormTemplate {
  id: number;
  title: string;
  webId: string;
  listId: string;
  contentTypeId: string;
  formTemplate: ComponentConfig;
}
