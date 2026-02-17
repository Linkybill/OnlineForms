import * as log from "loglevel";
import { ErrorViewModel } from "../../../../models/ErrorViewModel";
import { loadFieldSchema } from "../../../../listItem/helper/ListHelper";
import { IDraggableComponentProps } from "../dragDrop/DraggableComponent";
import { AcceptComponent } from "../../models/DragDropAcceptType";
import { componentNames } from "../../../componentProxy/models/componentNames";
import { FieldDescriptionTypes } from "../../../../listItem/types/FieldDescriptionTypes";

export const loadFieldDescriptions = async (webId: string, listId: string, contentTypeId: string): Promise<ErrorViewModel<FieldDescriptionTypes[]>> => {
  try {
    const descriptions = await loadFieldSchema(webId, listId, contentTypeId);
    return {
      error: undefined,
      model: descriptions
    };
  } catch (e) {
    log.error("Could not load FieldDescriptions from list with ids webId, listId, contentTypeId", webId, listId, contentTypeId);
    return Promise.resolve({
      error: "Feldinformationen konnten nicht geladen werden",
      model: []
    });
  }
};

export const mapFieldDescriptionsToDraggableComponents = (descriptions: FieldDescriptionTypes[]) => {
  const draggableComponents = descriptions.map((description): IDraggableComponentProps => {
    return {
      type: AcceptComponent,
      componentName: description.displayName,
      componentConfig: {
        name: componentNames.fieldPlaceholder,
        props: description
      },
      description: description.description,
      title: description.internalName,
      canBeUsedOnceOnly: true
    };
  });
  return draggableComponents;
};
