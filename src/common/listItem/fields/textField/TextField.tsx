import { TextField as FluentUiTextField, MessageBar, MessageBarType } from "@fluentui/react";
import log from "loglevel";
import { IFieldComponentProps } from "../base/FieldComponentProps";
import { TextFieldDescription } from "./TextFieldDescription";
import { FieldTextRenderer } from "@pnp/spfx-controls-react";
import * as React from "react";
import { WithErrorsBottom } from "../../../components/errorComponent/WithErrorsBottom";
import { PrintalbeVersionOfTextField } from "../printableVersionOfTextField";

export interface ITextFieldProps extends IFieldComponentProps<TextFieldDescription, string | number> {}

export const TextField = (props: ITextFieldProps): JSX.Element => {
  log.debug("rendering TextField " + props.fieldDescription.internalName + " with props", props);
  let valToUse: string = undefined;
  if (props.fieldValue !== null && props.fieldValue !== undefined) {
    valToUse = props.fieldValue.toString();
  }
  const [value, setValue] = React.useState<string>(valToUse);
  if (props.renderAsTextOnly) {
    return <FieldTextRenderer text={valToUse}></FieldTextRenderer>;
  }

  React.useEffect(() => {
    setValue(valToUse);
  }, [props.fieldValue]);

  return (
    <WithErrorsBottom errors={props.validationErrors}>
      <FluentUiTextField
        className="inScreenOnly"
        onBlur={() => {
          log.debug("onBlur for textfield " + props.fieldDescription.internalName);
          props.onBlur(props.fieldDescription, value, []);
        }}
        label={props.fieldDescription.displayName}
        key={props.fieldDescription.internalName}
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          props.onValueChanged(props.fieldDescription, newValue);
        }}
        required={props.fieldDescription.required}
        readOnly={props.editMode === false}
        type="text"
      />
      <PrintalbeVersionOfTextField
        displayName={props.fieldDescription.displayName}
        fieldValue={props.fieldValue !== undefined && props.fieldValue !== null ? props.fieldValue.toString() : ""}
        required={props.fieldDescription.required}
      />
    </WithErrorsBottom>
  );
};
