import React, { useEffect, useState } from "react";
import { TextKeyChoice } from "../ChoiceFieldDescription";

import { ChoiceGroup, IChoiceGroupOption } from "@fluentui/react";
import { WithErrorsBottom } from "../../../../components/errorComponent/WithErrorsBottom";
import { FieldTextRenderer } from "@pnp/spfx-controls-react";
import { IRadioFieldProps } from "./RadioFieldProperties";
import { useParameterPickerContext } from "../../../../helper/parameterPickerContext/ParameterPickerContext";
import { useComponentContext } from "../../../../helper/CurrentWebPartContext";
import { useListItemContext } from "../../../../helper/ListItemContext";
import { usePermissionContext } from "../../../../helper/PermissionContext";
import { Guid } from "@microsoft/sp-core-library";
import { JsonLogicHelper } from "../../../../helper/JSONLogicHelper";

export const RadioFieldWithTextKeyChoiceInValue = (props: IRadioFieldProps): JSX.Element => {
  const [currentKey, setCurrentKey] = useState<string>(Guid.newGuid().toString());
  const parameterContext = useParameterPickerContext();
  const componentContext = useComponentContext();
  const listItemContext = useListItemContext();
  const permissionContext = usePermissionContext();
  const currentValue = props.fieldValue !== undefined ? (props.fieldValue as TextKeyChoice[]) : ([] as TextKeyChoice[]);
  const currentSelectedKeys = currentValue.map((v) => v.key);
  const listItemContextToUseForContent = parameterContext.listItemContextForParameterPicker === undefined ? listItemContext : parameterContext.listItemContextForParameterPicker;

  let choiceGroupOptions: any[] = props.fieldDescription.choices.map((choice): any => {
    return {
      key: choice,
      text: choice
    };
  });

  const concatenatedFieldValue = props.fieldValue !== null && props.fieldValue !== undefined ? props.fieldValue.join(",") : "";

  useEffect(() => {
    setCurrentKey(Guid.newGuid().toString());
  }, [concatenatedFieldValue]);

  if (props.fieldDescription.formulaForChoices !== undefined && props.fieldDescription.formulaForChoices !== null && props.fieldDescription.formulaForChoices !== "") {
    const helper = new JsonLogicHelper(componentContext.context, listItemContext, 1, permissionContext);

    const optionsArray: TextKeyChoice[] = helper.evaluate<TextKeyChoice[]>(props.fieldDescription.formulaForChoices, listItemContextToUseForContent.getListItem(), listItemContext.getDatasourceResults());

    choiceGroupOptions = optionsArray;
  }

  if (!choiceGroupOptions) {
    choiceGroupOptions = [];
  }

  currentValue.forEach((element) => {
    const exists = choiceGroupOptions.some((o) => o.key === element.key);
    if (!exists) {
      const missingOption: IChoiceGroupOption = {
        key: element.key,
        text: element.text
      };
      choiceGroupOptions = [...choiceGroupOptions, missingOption];
    }
  });

  if (props.renderAsTextOnly) {
    return <FieldTextRenderer text={currentValue.map((v) => v.text).join(",")}></FieldTextRenderer>;
  }
  return (
    <>
      <WithErrorsBottom errors={props.validationErrors}>
        <ChoiceGroup
          key={currentKey}
          disabled={props.editMode !== true}
          label={props.fieldDescription.displayName}
          defaultSelectedKey={currentValue.length > 0 ? currentSelectedKeys[0] : undefined}
          selectedKey={currentValue.length > 0 ? currentSelectedKeys[0] : undefined}
          options={choiceGroupOptions}
          onChange={(ev, option) => {
            props.onValueChanged(props.fieldDescription, [option]);
          }}
          required={props.fieldDescription.required}
        />
      </WithErrorsBottom>
    </>
  );
};
