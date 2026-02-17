import { Checkbox, ICheckboxStyles } from "@fluentui/react";
import log from "loglevel";
import { IBooleanFieldProps } from "./BooleanFieldProps";
import { FieldTextRenderer } from "@pnp/spfx-controls-react";
import * as React from "react";
import { WithErrorsBottom } from "../../../components/errorComponent/WithErrorsBottom";
import { LabelWithRequiredInfo } from "../../labelWithRequiredInfo";

const checkBoxStyles: ICheckboxStyles = {
  checkmark: {},
  checkbox: {},
  text: {}
};

export const BooleanField = (props: IBooleanFieldProps): JSX.Element => {
  // debug logging added
  // checked - cleanup
  const checked: boolean = props.fieldValue !== undefined && props.fieldValue === true;

  if (props.renderAsTextOnly) {
    return <FieldTextRenderer text={props.rawData}></FieldTextRenderer>;
  }
  return (
    <WithErrorsBottom errors={props.validationErrors}>
      <Checkbox
        styles={checkBoxStyles}
        required={props.fieldDescription.required}
        label={props.fieldDescription.displayName}
        onRenderLabel={(): JSX.Element => {
          return <LabelWithRequiredInfo required={props.fieldDescription.required} text={props.fieldDescription.displayName} />;
        }}
        checked={checked}
        key={props.fieldDescription.internalName}
        onChange={(event, checked) => {
          props.onValueChanged(props.fieldDescription, checked);
        }}
        disabled={!props.editMode}></Checkbox>
    </WithErrorsBottom>
  );
};
