import log from "loglevel";
import { IFieldComponentProps } from "../base/FieldComponentProps";
import * as React from "react";
import { LogicEditorFieldDescription } from "./LogicEditorFieldDescription";
import { ConditionEditor } from "../../../components/editor/components/conditionEditor/ConditionEditor";

export interface ILogicEditorFieldProps extends IFieldComponentProps<LogicEditorFieldDescription, string> {}
export const LogicEditorField = (props: ILogicEditorFieldProps): JSX.Element => {
  log.debug("rendering LogicEditorField name " + props.fieldDescription.internalName + " with properties", {
    props: props,
    disabled: !props.editMode
  });

  return (
    <ConditionEditor
      conditionShouldProduceType="any"
      condition={props.fieldValue}
      label={props.fieldDescription.displayName}
      onChange={(value) => {
        props.onValueChanged(props.fieldDescription, value);
      }}
    />
  );
};
