import { IFieldComponentProps } from "../base/FieldComponentProps";
import * as React from "react";
import { EditorModel } from "../../../components/editor/models/EditorModel";
import { Editor } from "../../../components/editor/components/Editor";
import { ToolpaneComponents } from "../../../components/editor/models/ToolPaneComponents";
import { TemplateEditorFieldDescription } from "./TemplateEditorFieldDescription";
import { ActionButton } from "@fluentui/react";

export interface ITemplateEditorFieldProps extends IFieldComponentProps<TemplateEditorFieldDescription, EditorModel> {}

export const TemplateEditorField = (props: ITemplateEditorFieldProps): JSX.Element => {
  const [isEditing, setIsEditing] = React.useState(false);
  return (
    <>
      <ActionButton
        iconProps={{ iconName: "Edit" }}
        text="Vorlage bearbeiten"
        label="Vorlage bearbeiten"
        onClick={() => {
          setIsEditing(true);
        }}
      />
      {isEditing === true && (
        <Editor
          onSaveClick={(model) => {
            props.onValueChanged(props.fieldDescription, model);
          }}
          isLoading={false}
          onCloseClick={() => {
            setIsEditing(false);
          }}
          onSaveAndCloseClick={(model: EditorModel) => {
            props.onValueChanged(props.fieldDescription, model);

            setIsEditing(false);
          }}
          editorModel={props.fieldValue}
          availableComponents={{
            categories: [ToolpaneComponents.componentsCategory]
          }}></Editor>
      )}
    </>
  );
};
