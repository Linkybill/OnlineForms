import React from "react";
import { TriggerType, TriggerTypes } from "../models/ActionTriggerTypes";
import { TriggerConfigType } from "../models/TriggerConfigType";
import { DatasourceTriggerConfig } from "../models/datasources/DatasourceTriggerConfig";
import { DatasourceTriggerEditor } from "./datasources/DatasourceTriggerEditor";
import { SetFieldValueConfigEditor } from "./setFieldValue/SetFieldValueConfigEditor";
import { SetFieldValueTriggerConfig } from "../models/setFieldValue/SetFieldValueTriggerConfig";
import { SaveFormTriggerConfigEditor } from "./SaveFormTrigger/SaveFormTriggerConfigEditor";
import { SaveFormTriggerConfig } from "../models/saveFormTrigger/SaveFormTriggerConfig";
import { ContainerTriggerEditor } from "./ContainerTrigger/ContainerTriggerEditor";
import { ContainerTriggerConfig } from "../models/ContainerTrigger/ContainerTriggerConfig";
import { CreateFormVersionTriggerEditor } from "./createFormVersionTrigger/CreateFormVersionTriggerEditor";
import { CreateFormVersionTriggerConfig } from "../models/createFormVersion/CreateFormVersionTriggerConfig";
import { SharePointCreateListItemsTriggerEditor } from "./sharePointCreateListItems/SharePointCreateListItemsTriggerEditor";
import { SharePointCreateListItemsTriggerConfig } from "../models/sharePointCreateListItems/SharePointCreateListItemsTriggerConfig";
import { SetRepeatedListFieldTriggerEditor } from "./setRepeatedListField/SetRepeatedListFieldTriggerEditor";
import { SetRepeatedListFieldTriggerConfig } from "../models/setRepeatedListField/SetRepeatedListFieldTriggerConfig";

export const ActionTriggerConfigEditor = (props: { uniqueTriggerIdentifier: string; triggerType: TriggerType; actionTriggerConfig: TriggerConfigType; onConfigModified: (modifiedConfig: TriggerConfigType) => void }) => {
  switch (props.triggerType) {
    case TriggerTypes.CreateVersionTriggerType:
      return <CreateFormVersionTriggerEditor uniqueTriggerIdentifier="" config={props.actionTriggerConfig as CreateFormVersionTriggerConfig} onConfigChanged={props.onConfigModified}></CreateFormVersionTriggerEditor>;
    case TriggerTypes.DatasourceTriggerType:
      return <DatasourceTriggerEditor datasourceTrigger={props.actionTriggerConfig as DatasourceTriggerConfig} onDatasourceTriggerChanged={props.onConfigModified}></DatasourceTriggerEditor>;
    case TriggerTypes.SetFieldValueTriggerType:
      return <SetFieldValueConfigEditor config={props.actionTriggerConfig as SetFieldValueTriggerConfig} onConfigChanged={props.onConfigModified} />;
    case TriggerTypes.SaveFormTriggerType:
      return (
        <SaveFormTriggerConfigEditor
          config={props.actionTriggerConfig as SaveFormTriggerConfig}
          onConfigChanged={(changedConfig) => {
            const newConfig: SaveFormTriggerConfig = changedConfig;
            props.onConfigModified(newConfig);
          }}
        />
      );
    case TriggerTypes.ContainerTriggerType:
      return (
        <ContainerTriggerEditor
          uniqueTriggerIdentifier={props.uniqueTriggerIdentifier}
          config={props.actionTriggerConfig as ContainerTriggerConfig}
          onConfigChanged={(changedConfig) => {
            const newConfig: ContainerTriggerConfig = { ...props.actionTriggerConfig, childActions: changedConfig.childActions };
            props.onConfigModified(newConfig);
          }}
        />
      );
    case TriggerTypes.SharePointCreateListItemsTriggerType:
      return <SharePointCreateListItemsTriggerEditor config={props.actionTriggerConfig as SharePointCreateListItemsTriggerConfig} onConfigChanged={props.onConfigModified} />;
    case TriggerTypes.SetRepeatedListFieldTriggerType:
      return <SetRepeatedListFieldTriggerEditor config={props.actionTriggerConfig as SetRepeatedListFieldTriggerConfig} onConfigChanged={props.onConfigModified} />;
    default:
      return <>Triggertyp {props.triggerType} nicht unterstützt.</>;
  }
};
