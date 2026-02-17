import log from "loglevel";
import { FormTemplateViewModel } from "../models/FormTemplateViewModel";

export const mapListItemToFormTemplateViewModel = (listItem: any): FormTemplateViewModel => {
  const templateToreturn: FormTemplateViewModel = {
    formTemplateListItemId: listItem.ID,
    title: listItem.Title,
    editorModel: {
      fieldTriggers: [],
      saveTriggers: [],
      startupTriggers: [],
      componentConfig: null,
      uniqueComponentKeys: [],
      customFieldDefinitions: [],
      datasources: [],
      containerFieldsAreLockedConditions: {},
      containerHiddenWhenConditions: {}
    },
    contentTypeId: listItem.DemoFrmCTId,
    listId: listItem.DemoFrmListId,
    webId: listItem.DemoFrmWebId
  };
  log.debug("FormTemplateManager: mapped listItemToTemplate: ", {
    listItem: listItem,
    template: templateToreturn
  });
  return templateToreturn;
};
