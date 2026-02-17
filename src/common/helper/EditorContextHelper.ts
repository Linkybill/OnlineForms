import { ActionTrigger } from "../actions/models/ActionTrigger";
import { TriggerTypes } from "../actions/models/ActionTriggerTypes";
import { ContainerTriggerConfig } from "../actions/models/ContainerTrigger/ContainerTriggerConfig";
import { EditorModel } from "../components/editor/models/EditorModel";

export const findAllDatasourceTriggers = (editorModel: EditorModel): ActionTrigger[] => {
  const triggers = [...editorModel.saveTriggers, ...editorModel.startupTriggers, ...editorModel.fieldTriggers];
  return findAllDatasourceTriggersRecursive(triggers, []);
};

const findAllDatasourceTriggersRecursive = (triggers: ActionTrigger[], currentMatches: ActionTrigger[]): ActionTrigger[] => {
  triggers.forEach((t) => {
    if (t.type === TriggerTypes.DatasourceTriggerType) {
      currentMatches.push(t);
    }
    if (t.type === TriggerTypes.ContainerTriggerType) {
      const containerConfig = t.config as ContainerTriggerConfig;
      findAllDatasourceTriggersRecursive(containerConfig.childActions, currentMatches);
    }
  });
  return currentMatches;
};
