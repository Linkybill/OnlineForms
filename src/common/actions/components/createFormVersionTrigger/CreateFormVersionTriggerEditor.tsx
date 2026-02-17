import React from "react";
import { CreateFormVersionTriggerConfig } from "../../models/createFormVersion/CreateFormVersionTriggerConfig";
import { ConditionEditor } from "../../../components/editor/components/conditionEditor/ConditionEditor";

export const CreateFormVersionTriggerEditor = (props: {
  uniqueTriggerIdentifier: string;
  config: CreateFormVersionTriggerConfig;
  onConfigChanged: (changedConfig: CreateFormVersionTriggerConfig) => void;
}): JSX.Element => {
  return (
    <>
      <ConditionEditor
        conditionShouldProduceType="string"
        condition={props.config.commentExpression}
        label="Ausdruck für Kommentar"
        onChange={(val) => {
          props.onConfigChanged({ ...props.config, commentExpression: val });
        }}></ConditionEditor>
    </>
  );
};
