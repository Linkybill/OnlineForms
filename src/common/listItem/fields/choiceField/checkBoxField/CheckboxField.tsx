import React from "react";
import { IFieldComponentProps } from "../../base/FieldComponentProps";
import { ChoiceFieldDescription } from "../ChoiceFieldDescription";
import { Checkbox } from "@fluentui/react";
import { LabelWithRequiredInfo } from "../../../labelWithRequiredInfo";
import { WithErrorsBottom } from "../../../../components/errorComponent/WithErrorsBottom";
import { FieldTextRenderer } from "@pnp/spfx-controls-react";
import { ICheckboxFieldProps } from "./CheckboxFieldProps";

export const CheckboxField = (props: ICheckboxFieldProps): JSX.Element => {
  const currentValue = props.fieldValue !== undefined ? (props.fieldValue as string[]) : [];
  if (props.renderAsTextOnly) {
    return <FieldTextRenderer text={currentValue.join(",")}></FieldTextRenderer>;
  }
  const checkboxes = props.fieldDescription.choices.map((choice): JSX.Element => {
    return (
      <Checkbox
        disabled={props.editMode !== true}
        label={choice}
        checked={currentValue.indexOf(choice) !== -1}
        onChange={(ev, checked) => {
          let newValue = [];
          if (checked === true) {
            newValue = [...currentValue, choice];
          } else {
            newValue = currentValue.filter((val) => val !== choice);
          }
          props.onValueChanged(props.fieldDescription, newValue);
        }}
      />
    );
  });
  return (
    <>
      <WithErrorsBottom errors={props.validationErrors}>
        <>
          <LabelWithRequiredInfo required={props.fieldDescription.required} text={props.fieldDescription.displayName} />
          {checkboxes}
        </>
      </WithErrorsBottom>
    </>
  );
};
