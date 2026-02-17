import { TextField as FluentUiTextField, MessageBar, MessageBarType, TextField } from "@fluentui/react";
import log from "loglevel";
import { IFieldComponentProps } from "../base/FieldComponentProps";
import { CurrencyFieldDescription } from "./CurrencyFieldDescription";
import { FieldTextRenderer } from "@pnp/spfx-controls-react";
import lcid from "lcid";
import * as React from "react";
import { NumberField } from "../numberField/NumberField";
import { NumberFieldDescription } from "../numberField/NumberFieldDescription";
import { FieldTypeNames } from "../../FieldTypeNames";

export interface ICurrencyFieldProps extends IFieldComponentProps<CurrencyFieldDescription, string | number> {}

export const CurrencyField = (props: ICurrencyFieldProps): JSX.Element => {
  var currencyFormatter: any = require("currency-formatter");
  var localeId = 1031;
  if (!isNaN(props.fieldDescription.currencyLocaleId)) {
    localeId = props.fieldDescription.currencyLocaleId;
  }
  const localeString = (lcid as any).from(localeId).replace("_", "-");

  const formatted: string = currencyFormatter.format(0, {
    locale: localeString
  });

  const currencySignMatches = formatted.match("[^0-9\\.,\\-\\s]+");
  const currency = currencySignMatches ? ([0] ? currencySignMatches[0] : "") : "";

  const numberFieldDescription: NumberFieldDescription = {
    inputSuffix: currency,
    defaultValue: props.fieldDescription.defaultValue,
    description: props.fieldDescription.description,
    displayName: props.fieldDescription.displayName,
    internalName: props.fieldDescription.internalName,
    numberOfDecimals: props.fieldDescription.numberOfDecimals,
    required: props.fieldDescription.required,
    requiredWhenCondition: props.fieldDescription.requiredWhenCondition,
    type: FieldTypeNames.Number,
    uniqueKey: props.fieldDescription.uniqueKey,
    isReadOnly: props.fieldDescription.isReadOnly,
    lockedWhenCondition: props.fieldDescription.lockedWhenCondition,
    validationRules: props.fieldDescription.validationRules
  };
  return (
    <>
      <NumberField
        editMode={props.editMode}
        onBlur={(fieldDescription, value) => {
          props.onBlur(props.fieldDescription, value);
        }}
        rawData={props.rawData}
        renderAsTextOnly={props.renderAsTextOnly}
        validationErrors={props.validationErrors}
        fieldDescription={numberFieldDescription}
        key={props.fieldDescription.internalName}
        fieldValue={props.fieldValue}
        onValueChanged={(fieldDescription, value) => {
          props.onValueChanged(props.fieldDescription, value);
        }}></NumberField>
    </>
  );
};
