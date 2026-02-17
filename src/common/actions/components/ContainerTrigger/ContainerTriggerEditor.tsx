import React from "react";
import { ContainerTriggerConfig } from "../../models/ContainerTrigger/ContainerTriggerConfig";
import { ActionTriggerList } from "../ActionTriggerList";

export const ContainerTriggerEditor = (props: { uniqueTriggerIdentifier: string; config: ContainerTriggerConfig; onConfigChanged: (changedConfig: ContainerTriggerConfig) => void }): JSX.Element => {
  return (
    <>
      <ActionTriggerList
        parentContainerId={props.uniqueTriggerIdentifier}
        saveImmediatly={true}
        actionTrigger={props.config.childActions}
        onTriggerListChanged={(changedList) => {
          const newConfig: ContainerTriggerConfig = { ...props.config, childActions: changedList };
          props.onConfigChanged(newConfig);
        }}></ActionTriggerList>
    </>
  );
};
