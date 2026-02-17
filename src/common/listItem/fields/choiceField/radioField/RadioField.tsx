import React, { useEffect, useRef, useState } from "react";
import { ChoiceGroup, IChoiceGroupOption } from "@fluentui/react";
import { WithErrorsBottom } from "../../../../components/errorComponent/WithErrorsBottom";
import { FieldTextRenderer } from "@pnp/spfx-controls-react";
import { IRadioFieldProps } from "./RadioFieldProperties";
import log from "loglevel";
import { Guid } from "@microsoft/sp-core-library";

export const RadioField = (props: IRadioFieldProps): JSX.Element => {
  const currentValue = props.fieldValue !== undefined ? (props.fieldValue as string[]) : ([] as string[]);
  const [currentKey, setCurrentKey] = useState<string>(Guid.newGuid().toString());
  const choiceGroupOptions = props.fieldDescription.choices.map((choice): IChoiceGroupOption => {
    return {
      key: choice,
      text: choice,
      value: choice
    };
  });
  if (props.renderAsTextOnly) {
    return <FieldTextRenderer text={currentValue.join(",")}></FieldTextRenderer>;
  }

  useEffect(() => {
    log.debug("rerendering choicefield", props);

    setCurrentKey(Guid.newGuid().toString());
  }, [props.fieldValue]);
  log.debug("rendering choicefield " + props.fieldDescription.internalName, props);

  return (
    <>
      <WithErrorsBottom errors={props.validationErrors}>
        <ChoiceGroup
          key={currentKey}
          value={currentValue}
          disabled={props.editMode !== true}
          label={props.fieldDescription.displayName}
          selectedKey={currentValue.length > 0 ? currentValue[0] : undefined}
          options={choiceGroupOptions}
          onChange={(ev, option) => {
            props.onValueChanged(props.fieldDescription, [option.text]);
          }}
          required={props.fieldDescription.required}
        />
      </WithErrorsBottom>
    </>
  );
};
