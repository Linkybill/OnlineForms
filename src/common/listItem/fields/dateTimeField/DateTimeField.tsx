import { DatePicker, IComboBox, IDatePickerStrings, TimePicker, Callout, ComboBox, ActionButton, IconButton, Dropdown, IDropdownOption, TextField, DefaultButton } from "@fluentui/react";
import React, { useState } from "react";
import { IDateTimeFIeldProps } from "./DateTimeFieldProps";
import { WithErrorsBottom } from "../../../components/errorComponent/WithErrorsBottom";
import log from "loglevel";
import { DateTimeDisplayMode } from "./DateTimeFieldDescription";
import { formatDate, formatTime } from "../../../helper/DateTimeHelper";
import { LabelWithRequiredInfo } from "../../labelWithRequiredInfo";
import { FieldDateRenderer } from "@pnp/spfx-controls-react";

export const DateTimeField: React.FC<IDateTimeFIeldProps> = (props) => {
  log.debug("rendering datetimefield with", { props: props });

  const onSelectDate = (selectedDate: Date) => {
    let timeToSet: Date | undefined = undefined;
    if (props.fieldValue !== undefined && props.fieldValue.time !== undefined) {
      timeToSet = selectedDate;
      if (selectedDate !== undefined) {
        timeToSet.setHours(props.fieldValue.time.getHours());
        timeToSet.setMinutes(props.fieldValue.time.getMinutes());
        timeToSet.setSeconds(props.fieldValue.time.getMinutes()), timeToSet.setMilliseconds(props.fieldValue.time.getMilliseconds());
      }
    }
    props.onValueChanged(props.fieldDescription, props.fieldValue === undefined ? { date: selectedDate, time: undefined } : { date: selectedDate, time: timeToSet });
  };

  const onTimePickerChange = (_ev: React.FormEvent<IComboBox>, selectedTime: Date) => {
    props.onValueChanged(props.fieldDescription, props.fieldValue === undefined ? { date: undefined, time: selectedTime } : { ...props.fieldValue, time: selectedTime });
  };

  const strings: IDatePickerStrings = {
    shortMonths: ["Jan", "Feb", "Mrz", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
    shortDays: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
    days: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
    goToToday: "Heute",
    months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
  };

  if (props.renderAsTextOnly === true) {
    let formatedDate = formatDate(props.fieldValue.date);
    if (props.fieldDescription.displayMode.toString() === DateTimeDisplayMode.DateAndTime.toString()) {
      formatedDate += " " + formatTime(props.fieldValue.time);
    }
    return <FieldDateRenderer text={formatedDate}></FieldDateRenderer>;
  }

  return (
    <WithErrorsBottom errors={props.validationErrors}>
      <>
        <LabelWithRequiredInfo required={props.fieldDescription.required} text={props.fieldDescription.displayName}></LabelWithRequiredInfo>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gridColumnGap: "3px" }}>
          <DatePicker
            allowTextInput={true}
            disabled={props.editMode === false}
            formatDate={(date) => {
              return formatDate(date);
            }}
            strings={strings}
            value={props.fieldValue !== undefined ? props.fieldValue.date : undefined}
            onSelectDate={onSelectDate}
            ariaLabel="Date picker"
            parseDateFromString={(dateString) => {
              const parts = dateString.split(".");
              if (parts.length !== 3) return null;

              const day = parseInt(parts[0], 10);
              const month = parseInt(parts[1], 10) - 1; // JS-Monate sind 0-basiert
              const year = parseInt(parts[2], 10);

              return new Date(year, month, day);
            }}
          />
          {props.fieldDescription.displayMode.toString() === DateTimeDisplayMode.DateAndTime.toString() && (
            <TextField
              disabled={props.editMode === false}
              onChange={(ev, val) => {
                const dateToUse = props.fieldValue === undefined ? undefined : props.fieldValue.date;

                if (val !== undefined && val !== null && val !== "") {
                  const dateComponentUsedForTime = dateToUse !== undefined ? dateToUse : new Date();
                  const splittedVals = val.split(":");
                  const hours = Number.parseInt(splittedVals[0]);
                  const minutes = Number.parseInt(splittedVals[1]);
                  dateComponentUsedForTime.setHours(hours);
                  dateComponentUsedForTime.setMinutes(minutes);
                  dateComponentUsedForTime.setSeconds(0);
                  dateComponentUsedForTime.setMilliseconds(0);
                  props.onValueChanged(props.fieldDescription, { date: dateToUse, time: dateComponentUsedForTime });
                } else {
                  props.onValueChanged(props.fieldDescription, { date: dateToUse, time: undefined });
                }
              }}
              value={props.fieldValue !== undefined && props.fieldValue.time !== undefined ? formatTime(props.fieldValue.time) : ""}
              type="time"
            />
          )}
          {props.editMode === true && (
            <>
              <ActionButton
                iconProps={{
                  iconName: "Undo"
                }}
                className="resetDateButton"
                text={props.fieldDescription.displayMode === DateTimeDisplayMode.DateAndTime ? "Datum und Uhrzeit zurücksetzen" : "Datum zurücksetzen"}
                onClick={() => {
                  props.onValueChanged(props.fieldDescription, undefined);
                }}
              />
            </>
          )}
        </div>
      </>
    </WithErrorsBottom>
  );
};
