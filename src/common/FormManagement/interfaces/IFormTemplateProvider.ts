import { FormTemplate } from "../models/FormTemplate";

export interface IFormTemplateProvider {
  getFormTemplates: (webId: string, listId: string, contentTypeId: string) => Promise<FormTemplate>;

  getFormTemplateForKey: (key: string) => Promise<FormTemplate>;

  updateFormTemplate: (formTemplate: FormTemplate) => Promise<void>;

  assignFormTemplate: (formTemplateId: number, key: number) => Promise<void>;

  unassignFormTemplate: (formTemplateId: number, key: number) => Promise<void>;
}
