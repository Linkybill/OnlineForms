import { Callout, DirectionalHint, IconButton, Label, MessageBar, MessageBarType, TextField } from "@fluentui/react";
import { IFieldComponentProps } from "../base/FieldComponentProps";
import { UrlFieldDescription } from "./UrlFieldDescription";
import { UrlValue } from "../valueTypes/UrlValue";
import { FieldUrlRenderer } from "@pnp/spfx-controls-react";
import { useId } from "@fluentui/react-hooks";
import log from "loglevel";
import * as React from "react";
import { WithErrorsBottom } from "../../../components/errorComponent/WithErrorsBottom";
import { LabelWithRequiredInfo } from "../../labelWithRequiredInfo";

export interface IUrlFieldProps extends IFieldComponentProps<UrlFieldDescription, UrlValue | undefined> {}

export const UrlField = (props: IUrlFieldProps): JSX.Element => {
  const [urlIsBeingEdited, setUrlIsBeingEdited] = React.useState<boolean>(false);
  const editIconButtonId = useId("editIconButton");
  const calloutLabelId = useId("callOutLableId");
  const [urlValue, setUrlValue] = React.useState<UrlValue>(props.fieldValue);

  React.useEffect(() => {
    setUrlValue(props.fieldValue);
  }, [JSON.stringify(props.fieldValue)]);

  const editIcon: JSX.Element = props.editMode ? (
    <>
      <LabelWithRequiredInfo required={props.fieldDescription.required} text={props.fieldDescription.displayName}></LabelWithRequiredInfo>
      <IconButton
        id={editIconButtonId}
        onClick={() => {
          setUrlIsBeingEdited(true);
        }}
        iconProps={{
          iconName: "edit"
        }}></IconButton>
    </>
  ) : (
    <></>
  );

  const editCallOut: JSX.Element = urlIsBeingEdited ? (
    <Callout
      ariaLabelledBy={`#${calloutLabelId}`}
      target={`#${editIconButtonId}`}
      role="dialog"
      gapSpace={0}
      onDismiss={() => {
        setUrlIsBeingEdited(false);
      }}
      directionalHint={DirectionalHint.bottomCenter}
      setInitialFocus
      style={{ padding: 15 }}>
      <Label id={calloutLabelId}>{props.fieldDescription.displayName} " bearbeiten"</Label>
      <TextField
        required={props.fieldDescription.required}
        label="Url"
        onGetErrorMessage={() => {
          return props.validationErrors !== undefined && props.validationErrors.length > 0 ? (
            <>
              {props.validationErrors.map((error) => {
                return <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>;
              })}
            </>
          ) : undefined;
        }}
        value={urlValue?.url}
        onChange={(event, newValue) => {
          const newUrl: UrlValue = {
            text: props.fieldValue?.text ? props.fieldValue.text : "",
            url: newValue as string
          };

          log.debug("changed url field", newUrl);
          setUrlValue(newUrl);
        }}></TextField>
      <TextField
        label="Text"
        value={urlValue?.text}
        onChange={(event, newValue) => {
          const newUrl: UrlValue = {
            text: newValue as string,
            url: props.fieldValue?.url ? props.fieldValue.url : ""
          };
          log.debug("changed url field", newUrl);
          setUrlValue(newUrl);
        }}></TextField>
      <IconButton
        iconProps={{
          iconName: "Accept"
        }}
        onClick={() => {
          props.onValueChanged(props.fieldDescription, urlValue);
          props.onBlur(props.fieldDescription, urlValue);
          setUrlIsBeingEdited(false);
        }}></IconButton>
    </Callout>
  ) : (
    <></>
  );

  log.debug("rendering url field", props);
  return (
    <WithErrorsBottom errors={props.validationErrors}>
      {editIcon}
      {editCallOut}
      <FieldUrlRenderer
        url={props.fieldValue?.url !== undefined ? props.fieldValue.url : ""}
        text={props.fieldValue?.text === "" ? props.fieldValue.url : props.fieldValue?.text}
        isImageUrl={props.fieldDescription.isImageUrl}
      />
    </WithErrorsBottom>
  );
};
