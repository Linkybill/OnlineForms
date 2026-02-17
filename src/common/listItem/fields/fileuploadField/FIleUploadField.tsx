import React, { useRef, useState } from "react";
import log from "loglevel";
import { IFileUploadFIeldProps } from "./FileUploadFieldProps";
import { ActionButton, DetailsList, IColumn, SelectionMode } from "@fluentui/react";
import { useFormFileContext } from "../../../helper/FormFileContext";
import { LabelWithRequiredInfo } from "../../labelWithRequiredInfo";
import { FileValue } from "./FileUploadFieldValue";

export const FileUploadField: React.FC<IFileUploadFIeldProps> = (props) => {
  log.debug("rendering fileuploadField with", { props: props });
  const fileContext = useFormFileContext();
  const createKeyForFile = (): string => {
    return props.fieldDescription.internalName;
  };
  const fileUploadRef = useRef(undefined);

  const valueToUse = props.fieldValue !== undefined && props.fieldValue !== null ? props.fieldValue : [];

  const [valueFromState, setValueFromState] = useState<FileValue[]>(valueToUse);

  const itemsForDetailsList = valueToUse.map((iteratedFileValue) => {
    return {
      title: (
        <ActionButton
          text={iteratedFileValue.title}
          onClick={(ev) => {
            ev.preventDefault();
            fileContext.openFile(iteratedFileValue.title);
          }}></ActionButton>
      ),
      originalTitle: iteratedFileValue.title,
      delete: (
        <ActionButton
          disabled={props.editMode !== true}
          onClick={() => {
            const newValue = valueToUse.filter((value) => iteratedFileValue.title !== value.title);
            fileContext.addFileBeingDeleted(iteratedFileValue.title);
            props.onValueChanged(props.fieldDescription, newValue);
          }}
          text="Löschen"
          iconProps={{ iconName: "Delete" }}></ActionButton>
      )
    };
  });
  const columnsForDetailsList: IColumn[] = [
    {
      key: "title",

      minWidth: 80,
      name: "Dateiname",
      fieldName: "title"
    }
  ];
  if (props.editMode === true) {
    columnsForDetailsList.push({
      key: "delete",
      minWidth: 80,
      name: "Löschen",
      fieldName: "delete"
    });
  }
  return (
    <>
      <LabelWithRequiredInfo required={props.fieldDescription.required} text={props.fieldDescription.displayName} />
      <input
        ref={(ref) => {
          fileUploadRef.current = ref;
        }}
        style={{ display: "none" }}
        disabled={(props.fieldDescription.allowMultipleFiles === false && valueToUse.length > 0) || props.editMode !== true}
        type="File"
        multiple={props.fieldDescription.allowMultipleFiles === true}
        onChange={(ev) => {
          var newValue = [...valueToUse];
          const key = createKeyForFile();
          for (var i = 0; i < ev.target.files.length; i++) {
            fileContext.addFilesBeingUploaded(key, [ev.target.files[i]]);
            const containsInValue = newValue.filter((v) => v.title === ev.target.files[i].name).length > 0;

            if (containsInValue == false) {
              newValue.push({
                title: ev.target.files[i].name
              });
            }
          }

          props.onValueChanged(props.fieldDescription, newValue);
        }}></input>

      <div className="inScreenOnly">
        <DetailsList selectionMode={SelectionMode.none} items={itemsForDetailsList} columns={columnsForDetailsList}></DetailsList>
        <ActionButton
          text="Datei hinzufügen"
          disabled={(props.fieldDescription.allowMultipleFiles === false && valueToUse.length > 0) || props.editMode !== true}
          iconProps={{ iconName: "Add" }}
          onClick={() => {
            fileUploadRef.current.click();
          }}
        />
      </div>
      <div className="inPrintOnly">
        <DetailsList selectionMode={SelectionMode.none} items={itemsForDetailsList} columns={[columnsForDetailsList[0]]}></DetailsList>
      </div>
    </>
  );
};
