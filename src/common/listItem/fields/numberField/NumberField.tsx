import { MaskedTextField, MessageBar, MessageBarType, TextField } from "@fluentui/react";
import { IFieldComponentProps } from "../base/FieldComponentProps";
import { NumberFieldDescription } from "./NumberFieldDescription";
import { FieldTextRenderer } from "@pnp/spfx-controls-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { WithErrorsBottom } from "../../../components/errorComponent/WithErrorsBottom";

export interface INumberFieldProps extends IFieldComponentProps<NumberFieldDescription, string | number> {}

export const NumberField = (props: INumberFieldProps): JSX.Element => {
  const formatNumber = (value: string | number, decimalPlaces: number, localeId: string): string => {
    if (value == undefined || value == null) {
      return "";
    }
    // Convert the value to a number and normalize the input
    let number = typeof value === "string" ? parseFloat(value.replace(/\./g, "").replace(",", ".")) : value;

    // Check if the number is valid
    if (isNaN(number)) {
      return value.toString(); // return the original value if not valid
    }
    number = parseFloat(number.toFixed(decimalPlaces));

    // Format the number to the specified decimal places using Intl.NumberFormat
    const formatter = new Intl.NumberFormat(localeId, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });

    return formatter.format(number);
  };

  const filterInput = (input: string): string => {
    // Entferne alle ungültigen Zeichen, aber erlaube das Minuszeichen am Anfang der Zahl
    let validInput = input.replace(/[^0-9.,-]/g, ""); // Erlaubt nur Ziffern, Kommas, Punkte und Minuszeichen
    // Erlaube nur das Minuszeichen am Anfang
    if (!validInput.startsWith("-")) {
      validInput = validInput.replace("-", "");
    } else {
      validInput = "-" + validInput.substring(1).replace("-", "");
    }
    return validInput;
  };

  useEffect(() => {
    setValue(props.fieldValue);
  }, [props.fieldValue]);

  let numberOfDecimals = 0;
  if (Array.isArray(props.fieldDescription.numberOfDecimals)) {
    if (props.fieldDescription.numberOfDecimals.length > 0) {
      if (!isNaN(props.fieldDescription.numberOfDecimals[0])) {
        numberOfDecimals = props.fieldDescription.numberOfDecimals[0];
      }
    }
  } else {
    if (!isNaN(props.fieldDescription.numberOfDecimals as number)) {
      numberOfDecimals = props.fieldDescription.numberOfDecimals as number;
    }
  }

  const [value, setValue] = useState<number | string>(props.fieldValue ? props.fieldValue : "");
  const [displayValue, setDisplayValue] = useState(props.fieldValue ? formatNumber(props.fieldValue as string, numberOfDecimals, "de-DE") : "");

  var textBoxPrefix = props.fieldDescription.inputPrefix !== undefined && props.fieldDescription.inputPrefix !== null ? props.fieldDescription.inputPrefix : undefined;
  var textBoxSuffix = props.fieldDescription.inputSuffix !== undefined && props.fieldDescription.inputSuffix !== null ? props.fieldDescription.inputSuffix : undefined;
  var labelPrefixWithWhiteSpace =
    props.fieldDescription.labelPrefix !== undefined && props.fieldDescription.labelPrefix !== null && props.fieldDescription.labelPrefix !== "" ? props.fieldDescription.labelPrefix + " " : "";
  var labelSuffixWithWhiteSpace =
    props.fieldDescription.labelSuffix !== undefined && props.fieldDescription.labelSuffix !== null && props.fieldDescription.labelSuffix !== "" ? " " + props.fieldDescription.labelSuffix : "";

  if (props.renderAsTextOnly) {
    const textBoxPrefixWithWhiteSpace = textBoxPrefix !== undefined ? textBoxPrefix + " " : "";
    const textBoxSuffixWithWhiteSpace = textBoxSuffix !== undefined ? " " + textBoxSuffix : "";
    return <FieldTextRenderer text={textBoxPrefixWithWhiteSpace + props.fieldValue + textBoxSuffixWithWhiteSpace}></FieldTextRenderer>;
  }

  return (
    <>
      <WithErrorsBottom errors={props.validationErrors}>
        <TextField
          label={labelPrefixWithWhiteSpace + props.fieldDescription.displayName + labelSuffixWithWhiteSpace}
          inputMode={props.fieldDescription.numberOfDecimals > 0 ? "decimal" : "numeric"}
          key={props.fieldDescription.internalName}
          suffix={textBoxSuffix}
          prefix={textBoxPrefix}
          value={displayValue || value !== undefined ? value.toString() : ""}
          onBlur={() => {
            if (value === "") {
              props.onBlur(props.fieldDescription, value);
            } else {
              const errors = new Array<string>();
              if (isNaN(Number(value.toString().replace(/\./g, "").replace(",", ".")))) {
                errors.push("Der Wert ist keine gültige Zahl");
              } else {
                const newValue = formatNumber(value, numberOfDecimals, "de-DE");
                setDisplayValue(newValue);
                props.onValueChanged(props.fieldDescription, parseFloat(newValue.replace(/\./g, "").replace(",", ".")));
                props.onBlur(props.fieldDescription, parseFloat(newValue.replace(/\./g, "").replace(",", ".")));
              }
            }
          }}
          onChange={(event, newValue) => {
            const filteredValue = filterInput(newValue);
            setValue(filteredValue);
            setDisplayValue(filteredValue);
            const normalizedValue = parseFloat(filteredValue.replace(/\./g, "").replace(",", "."));
            props.onValueChanged(props.fieldDescription, normalizedValue);
          }}
          required={props.fieldDescription.required}
          disabled={!props.editMode}
          type="text" // Set type to text to handle decimal inputs correctly
        ></TextField>
      </WithErrorsBottom>
    </>
  );
};
