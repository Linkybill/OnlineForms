import { sp } from "@pnp/sp";
import { DatasourceTypeNames } from "../../../common/actions/models/datasources/DataSourceTypes";
import { SharePointDatasourceConfig } from "../../../common/actions/models/datasources/SharePointDatasourceConfig";
import { EditorModel } from "../../../common/components/editor/models/EditorModel";
import { ListNames } from "../../formTemplateListActionsOnline/Constants";
import { formTemplateListName } from "../../../common/FormManagement/models/Constants";

export const createDefaultJSOnOrLoadBaseTemplateJSon = async (baseTemplateItemId: number | undefined): Promise<EditorModel> => {
  if (baseTemplateItemId !== undefined) {
    const template = await sp.site.rootWeb.lists.getByTitle(ListNames.formTemplateListName).items.getById(baseTemplateItemId).file.getJSON();
    return template;
  }

  return {
    containerFieldsAreLockedConditions: {},
    containerHiddenWhenConditions: {},
    customFieldDefinitions: [],
    datasources: [],
    uniqueComponentKeys: [],
    fieldTriggers: [],
    saveTriggers: [],
    startupTriggers: [],
    componentConfig: {
      name: 2,
      props: {
        uniqueKey: "grid1",
        gridConfig: {
          rows: [
            {
              cells: []
            }
          ]
        }
      },
      uniqueComponentIdentifier: "root"
    }
  };
};
