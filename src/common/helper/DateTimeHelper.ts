const pad = (n: number): string => n.toString().padStart(2, "0");

const formatCustom = (date: Date, format: string): string => {
  const map: Record<string, string> = {
    YYYY: date.getFullYear().toString(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds())
  };

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => map[match]);
};

export const formatDateTime = (dateToFormat: Date | string, givenFormat?: string): string => {
  dateToFormat = getDateObjectFromStringOrDate(dateToFormat);
  if (givenFormat == null || givenFormat == undefined || givenFormat == "") {
    let format = new Intl.DateTimeFormat("de", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      timeZone: "Europe/Berlin",
      timeZoneName: undefined
    });

    return format.format(dateToFormat);
  } else {
    return formatCustom(dateToFormat, givenFormat);
  }
};

export const formatDate = (dateToFormat: Date | string, givenFormat?: string): string => {
  try {
    dateToFormat = getDateObjectFromStringOrDate(dateToFormat);
    if (givenFormat == null || givenFormat == undefined || givenFormat == "") {
      let format = new Intl.DateTimeFormat("de", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: undefined,
        minute: undefined,
        timeZone: "Europe/Berlin",
        timeZoneName: undefined
      });

      return format.format(dateToFormat);
    } else {
      return formatCustom(dateToFormat, givenFormat);
    }
  } catch (e) {
    return "";
  }
};

export const formatTime = (dateToFormat: Date | string): string => {
  try {
    dateToFormat = getDateObjectFromStringOrDate(dateToFormat);

    let format = new Intl.DateTimeFormat("de", {
      year: undefined,
      month: undefined,
      day: undefined,
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      timeZone: "Europe/Berlin",
      timeZoneName: undefined
    });

    return format.format(dateToFormat);
  } catch (e) {
    return "";
  }
};

const getDateObjectFromStringOrDate = (date: Date | string): Date => {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return date;
};
