import React from "react";
import { TextKeyChoice } from "../ChoiceFieldDescription";
import { Checkbox } from "@fluentui/react";
import { LabelWithRequiredInfo } from "../../../labelWithRequiredInfo";
import { WithErrorsBottom } from "../../../../components/errorComponent/WithErrorsBottom";
import { FieldTextRenderer } from "@pnp/spfx-controls-react";
import { ICheckboxFieldProps } from "./CheckboxFieldProps";
import { useParameterPickerContext } from "../../../../helper/parameterPickerContext/ParameterPickerContext";
import { useComponentContext } from "../../../../helper/CurrentWebPartContext";
import { useListItemContext } from "../../../../helper/ListItemContext";
import { usePermissionContext } from "../../../../helper/PermissionContext";
import { JsonLogicHelper } from "../../../../helper/JSONLogicHelper";

export const CheckboxFieldWithKeyTextValue = (props: ICheckboxFieldProps): JSX.Element => {
  const parameterContext = useParameterPickerContext();
  const componentContext = useComponentContext();
  const listItemContext = useListItemContext();
  const permissionContext = usePermissionContext();

  const listItemContextToUseForContent = parameterContext.listItemContextForParameterPicker === undefined ? listItemContext : parameterContext.listItemContextForParameterPicker;

  const currentValue = props.fieldValue !== undefined ? (props.fieldValue as TextKeyChoice[]) : ([] as TextKeyChoice[]);
  const selectedKeys = currentValue.map((v) => v.key);

  if (props.renderAsTextOnly) {
    // currentValue ist ein Array aus Objekten -> render nur Text sauber
    const txt = currentValue.map((x) => x.text ?? x.key).join(", ");
    return <FieldTextRenderer text={txt} />;
  }

  let checkboxes = props.fieldDescription.choices.map((choice): JSX.Element => {
    return (
      <Checkbox
        disabled={props.editMode !== true}
        label={choice}
        checked={selectedKeys.indexOf(choice) !== -1}
        onChange={(ev, checked) => {
          let newValue: TextKeyChoice[] = [];
          if (checked === true) {
            newValue = [...currentValue, { key: choice, text: choice }];
          } else {
            newValue = currentValue.filter((val) => val.key !== choice);
          }
          props.onValueChanged(props.fieldDescription, newValue);
        }}
      />
    );
  });

  if (props.fieldDescription.formulaForChoices) {
    const helper = new JsonLogicHelper(
      componentContext.context,
      listItemContextToUseForContent, // wichtig: gleicher Context wie Datenquelle
      1, // hier hast du vorher auch 1 genutzt
      permissionContext
    );

    const optionsArray: TextKeyChoice[] = helper.evaluate<TextKeyChoice[]>(props.fieldDescription.formulaForChoices, listItemContextToUseForContent.getListItem(), listItemContextToUseForContent.getDatasourceResults());

    checkboxes = (optionsArray ?? []).map((option) => {
      return (
        <Checkbox
          disabled={props.editMode !== true}
          label={option.text}
          checked={selectedKeys.indexOf(option.key) !== -1}
          onChange={(ev, checked) => {
            let newValue: TextKeyChoice[] = [];
            if (checked === true) {
              newValue = [...currentValue, { key: option.key, text: option.text, data: option.data }];
            } else {
              newValue = currentValue.filter((val) => val.key !== option.key);
            }
            props.onValueChanged(props.fieldDescription, newValue);
          }}
        />
      );
    });
  }

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
