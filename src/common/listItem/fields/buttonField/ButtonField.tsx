import log from "loglevel";
import { IFieldComponentProps } from "../base/FieldComponentProps";
import * as React from "react";
import { BUttonFieldDescription } from "./ButtonFieldDescription";
import { ActionButton, DefaultButton, IconButton, PrimaryButton } from "@fluentui/react";
import { useListItemContext } from "../../../helper/ListItemContext";

export interface IButtonFIeldProps extends IFieldComponentProps<BUttonFieldDescription, ButtonValue> {}
export interface ButtonValue {
  label: string;
  isDisabled: boolean;
  isVisible: boolean;
  value: string;
}
export const ButtonField = (props: IButtonFIeldProps): JSX.Element => {
  const listItemContext = useListItemContext();
  const isDisabled = props.editMode === false ? true : listItemContext.isButtonDisabled();
  const labelText = props.fieldValue !== undefined && props.fieldValue.label !== undefined && props.fieldValue.label !== "" ? props.fieldValue.label : props.fieldDescription.displayName;
  const buttonIsHidden = props.fieldValue !== undefined && props.fieldValue.isVisible === false;
  const buttonIsPrimaryButton = props.fieldDescription.isPrimaryButton === true;
  return (
    <>
      {buttonIsHidden === false && (
        <>
          {props.fieldDescription.isIconButton !== true && (
            <>
              {buttonIsPrimaryButton === true && (
                <>
                  <PrimaryButton
                    style={{ width: "100%" }}
                    onClick={() => {
                      log.debug("onclick for button " + props.fieldDescription.internalName);
                      props.onValueChanged(props.fieldDescription, props.fieldValue);
                    }}
                    text={labelText}
                    disabled={isDisabled}>
                    {labelText}
                  </PrimaryButton>
                </>
              )}
              {buttonIsPrimaryButton !== true && (
                <>
                  <DefaultButton
                    style={{ width: "100%" }}
                    onClick={() => {
                      props.onValueChanged(props.fieldDescription, props.fieldValue);
                    }}
                    text={labelText}
                    disabled={isDisabled}>
                    {labelText}
                  </DefaultButton>
                </>
              )}
            </>
          )}
        </>
      )}
      <>
        {props.fieldDescription.isIconButton === true && (
          <>
            <ActionButton
              iconProps={{
                iconName: props.fieldDescription.iconName
              }}
              onClick={() => {
                props.onValueChanged(props.fieldDescription, props.fieldValue);
              }}
              text={labelText}
              disabled={isDisabled}>
              {labelText}
            </ActionButton>
          </>
        )}
      </>
    </>
  );
};
