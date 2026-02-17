import { useState } from "react";
import { ActionButton, DefaultButton, IconButton, Label, TextField } from "@fluentui/react";
import { IListFieldProps } from "./ListField";
import log from "loglevel";
import * as React from "react";
import { WithErrorsBottom } from "../../../components/errorComponent/WithErrorsBottom";
import { LabelWithRequiredInfo } from "../../labelWithRequiredInfo";
import { DisabledTextField } from "../../../components/disabledTextField/DisabledTextField";

export const StringListField = (props: IListFieldProps): JSX.Element => {
  log.debug("rendering stringListField with props", props);
  let fieldValue = props.fieldValue !== undefined ? props.fieldValue : [];
  fieldValue = fieldValue.map((f) => {
    if (typeof f === "object" && f !== null) {
      log.warn("Unerwartetes Objekt in StringListField:", f);
      return JSON.stringify(f);
    }
    return f;
  });

  const itemsToRenderForScreen: JSX.Element[] = fieldValue.map((val, index): JSX.Element => {
    return (
      <span>
        {props.editMode === true && (
          <>
            <TextField
              onRenderSuffix={() => {
                return (
                  <>
                    {props.editMode !== false && (
                      <>
                        <IconButton
                          iconProps={{ iconName: "Delete" }}
                          onClick={() => {
                            fieldValue.splice(index, 1);
                            props.onValueChanged(props.fieldDescription, fieldValue);
                          }}></IconButton>
                      </>
                    )}
                  </>
                );
              }}
              disabled={false}
              style={{ paddingRight: 8, float: "left" }}
              value={val}
              onChange={(ev, newVal) => {
                const itemArray = fieldValue;
                itemArray[index] = newVal === undefined ? "" : newVal;
                props.onValueChanged(props.fieldDescription, itemArray);
              }}
            />
          </>
        )}
        {props.editMode !== true && (
          <>
            <DisabledTextField required={false} inPrintOnly={false} label="" labelShouldBeRendered={false} text={val} />
          </>
        )}
      </span>
    );
  });

  const itemsToRenderForPrint: JSX.Element[] = fieldValue.map((val, index): JSX.Element => {
    return (
      <span>
        <>
          <DisabledTextField required={false} inPrintOnly={false} label="" labelShouldBeRendered={false} text={val} />
        </>
      </span>
    );
  });

  return (
    <>
      <div className="inScreenOnly">
        <WithErrorsBottom errors={props.validationErrors}>
          <LabelWithRequiredInfo required={props.fieldDescription.required} text={props.fieldDescription.displayName} />

          <>{itemsToRenderForScreen}</>
          {props.editMode !== false && (
            <>
              <ActionButton
                className="iconButton listMenuAddButton"
                iconProps={{ iconName: "Add" }}
                text="Neues Element hinzufügen"
                onClick={() => {
                  props.onValueChanged(props.fieldDescription, [...fieldValue, ""]);
                }}></ActionButton>
            </>
          )}
        </WithErrorsBottom>
      </div>

      <div className="inPrintOnly">
        <WithErrorsBottom errors={props.validationErrors}>
          <LabelWithRequiredInfo required={props.fieldDescription.required} text={props.fieldDescription.displayName} />
          <>{itemsToRenderForPrint}</>
        </WithErrorsBottom>
      </div>
    </>
  );
};
