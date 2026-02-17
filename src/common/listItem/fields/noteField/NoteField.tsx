import { ActionButton, TextField } from "@fluentui/react";
import log from "loglevel";
import { IFieldComponentProps } from "../base/FieldComponentProps";
import { NoteFieldDescription } from "./NoteFieldDescription";
import { FieldTextRenderer } from "@pnp/spfx-controls-react";
import * as React from "react";
import { RichTextEditor } from "../../../components/editor/components/html/RichTextEditor";
import { ModalWithCloseButton } from "../../../components/modals/ModalWithCloseButton";
import { Html } from "../../../components/htmlComponent/htmlComponent";
import { WithErrorsBottom } from "../../../components/errorComponent/WithErrorsBottom";
import { LabelWithRequiredInfo } from "../../labelWithRequiredInfo";

export interface INoteFieldProps extends IFieldComponentProps<NoteFieldDescription, string> {
  wrapperClassname?: string;
}

export const NoteField = (props: INoteFieldProps): JSX.Element => {
  const [isHtmlMode, setIsHtmlMode] = React.useState<boolean>(false);

  const [value, setValue] = React.useState<string>(props.fieldValue);
  React.useEffect(() => {
    setValue(props.fieldValue);
  }, [props.fieldValue]);

  log.debug("rendering notefield name " + props.fieldDescription.internalName + " with properties", {
    props: props,
    disabled: !props.editMode
  });

  if (props.renderAsTextOnly) {
    if (props.fieldDescription.fullHtml == true) {
      return <Html listItemForTokenValues={{}} htmlWithTokens="" html={value === undefined ? "" : value} uniqueKey="htmlValue" tokenEditorSchema={[]}></Html>;
    }
    return <FieldTextRenderer text={props.fieldValue}></FieldTextRenderer>;
  }

  if (props.editMode === false && props.fieldDescription.fullHtml === true) {
    return (
      <>
        <LabelWithRequiredInfo required={props.fieldDescription.required} text={props.fieldDescription.displayName} />
        <div className="noteFieldHtmlContentReadonlyWrapper">
          <Html listItemForTokenValues={{}} htmlWithTokens="" html={value === undefined ? "" : value} uniqueKey="htmlValue" tokenEditorSchema={[]}></Html>
        </div>
      </>
    );
  }

  return (
    <>
      <WithErrorsBottom errors={props.validationErrors}>
        <LabelWithRequiredInfo required={props.fieldDescription.required} text={props.fieldDescription.displayName}></LabelWithRequiredInfo>
        <div style={{}}>
          {props.fieldDescription.fullHtml === true && (
            <>
              {isHtmlMode === true && (
                <ModalWithCloseButton
                  title="html bearbeiten"
                  isOpen={true}
                  onClose={() => {
                    setIsHtmlMode(false);
                    props.onValueChanged(props.fieldDescription, value);
                    props.onBlur(props.fieldDescription, value);
                  }}
                  styles={{
                    main: {
                      width: "100%"
                    }
                  }}>
                  <RichTextEditor
                    html={value}
                    key={props.fieldDescription.internalName}
                    onChange={(newHtml: string) => {
                      //props.onValueChanged(props.fieldDescription, newHtml);
                      setValue(newHtml);
                    }}></RichTextEditor>
                </ModalWithCloseButton>
              )}
              {isHtmlMode === false && (
                <div>
                  {props.editMode === true && (
                    <>
                      <ActionButton
                        onClick={() => {
                          setIsHtmlMode(true);
                        }}
                        label="Bearbieten"
                        text="HTML Editor öffnen"></ActionButton>
                    </>
                  )}
                  <Html listItemForTokenValues={{}} htmlWithTokens="" html={value === undefined ? "" : value} uniqueKey="htmlValue" tokenEditorSchema={[]}></Html>
                </div>
              )}
            </>
          )}
          {props.fieldDescription.fullHtml !== true && (
            <>
              <div className={"TextareaWrapper"}>
                <TextField
                  resizable={false}
                  required={props.fieldDescription.required}
                  readOnly={props.editMode !== true}
                  value={value}
                  multiline
                  autoAdjustHeight
                  onBlur={(ev) => {
                    props.onBlur(props.fieldDescription, ev.target.value);
                  }}
                  onChange={(ev, value) => {
                    setValue(value);
                    props.onValueChanged(props.fieldDescription, value);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </WithErrorsBottom>
    </>
  );
};
