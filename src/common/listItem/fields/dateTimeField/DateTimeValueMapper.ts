import { DateTimeValue } from "./DateTimeValue";

export const mapDateTimeValueToDate = (dateTimeValue: DateTimeValue): Date => {
  const dateToReturn = dateTimeValue.date;
  dateToReturn.setHours(dateTimeValue.time.getHours(), dateTimeValue.time.getMinutes(), dateTimeValue.time.getSeconds(), dateTimeValue.time.getMilliseconds());
  return dateToReturn;
};
