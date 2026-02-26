import logic from "json-logic-js";
import { formatDate, formatDateTime, formatTime } from "./DateTimeHelper";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { Guid } from "@microsoft/sp-core-library";
import log from "loglevel";
import { IListItemAccessor } from "./ListItemContext";
import { mapListItemToObject } from "../listItem/mapper/ListItemToObjectMapper";
import dayjs from "dayjs";
import { IGraphDataResponseDto } from "../formStatusFlow/models/GraphResponse";
import { PermissionInfos } from "./PermissionContext";
import { TextKeyChoice } from "../listItem/fields/choiceField/ChoiceFieldDescription";

dayjs().format();
const format: any = require("string-template");

export class JSONLogicInstance {
  private static _initialized = false;

  // Runtime-Context, der vor jeder Ausführung aktualisiert wird
  private static _runtime: {
    context: BaseComponentContext;
    listItemContext: IListItemAccessor;
    currentItemId: number | undefined;
    permissionInfo: PermissionInfos;
  } | null = null;

  /**
   * Liefert die globale json-logic-js Engine zurück.
   * - Registriert Custom Operations nur EINMAL
   * - Aktualisiert bei jedem Aufruf den Runtime-Context (für ops wie closeForm/currentUserCanWrite/etc.)
   */
  public static Instance = (componentContext: BaseComponentContext, listItemContext: IListItemAccessor, currentItemId: number | undefined, permissionInfo: PermissionInfos) => {
    JSONLogicInstance._runtime = {
      context: componentContext,
      listItemContext,
      currentItemId,
      permissionInfo
    };

    if (!JSONLogicInstance._initialized) {
      JSONLogicInstance.initializeJsonLogic();
      JSONLogicInstance._initialized = true;
    }

    return logic;
  };

  private static initializeJsonLogic = (): any => {
    // Helper: runtime context holen (immer aktuell gesetzt durch Instance())
    const ctx = () => {
      if (!JSONLogicInstance._runtime) {
        throw new Error("JSONLogicInstance runtime context not set. Call JSONLogicInstance.Instance(...) before apply().");
      }
      return JSONLogicInstance._runtime;
    };

    logic.add_operation("currentDate", () => {
      return new Date();
    });

    logic.add_operation("formatDate", formatDate);
    logic.add_operation("formatDateTime", formatDateTime);
    logic.add_operation("formatTime", formatTime);

    logic.add_operation("dateOnly", (givenDateTime: Date) => {
      return new Date(givenDateTime.getFullYear(), givenDateTime.getMonth(), givenDateTime.getDate());
    });

    logic.add_operation("addToDate", (date: Date, days?: number, hours?: number, minutes?: number): Date => {
      let dateToManipulate = dayjs(date);
      if (days !== undefined) {
        dateToManipulate = dateToManipulate.add(days, "day");
      }
      if (hours !== undefined) {
        dateToManipulate = dateToManipulate.add(hours, "hour");
      }
      if (minutes !== undefined) {
        dateToManipulate = dateToManipulate.add(minutes, "minute");
      }
      return dateToManipulate.toDate();
    });

    logic.add_operation("currentUserLoginName", () => {
      return ctx().context.pageContext.user.loginName;
    });

    logic.add_operation("formItemId", () => {
      return ctx().currentItemId !== undefined ? ctx().currentItemId : null;
    });

    logic.add_operation("currentWebUrl", (): string => {
      const url = new URL(ctx().context.pageContext.web.absoluteUrl);
      return url.href;
    });

    logic.add_operation("currentSiteCollectionUrl", (): string => {
      const url = new URL(ctx().context.pageContext.site.absoluteUrl);
      return url.href;
    });

    logic.add_operation("urlEncode", (stringToEncode: string): string => {
      return encodeURIComponent(stringToEncode);
    });

    logic.add_operation("hostUrl", (): string => {
      const host = window.location.protocol + "//" + window.location.host;
      return host;
    });

    logic.add_operation("val", (value: any) => {
      return value;
    });

    logic.add_operation("createGuid", () => {
      return Guid.newGuid();
    });

    logic.add_operation("indexOf", (searchArray: any[], index: number): any => {
      if (searchArray.length == undefined || searchArray.length == null || searchArray.length == 0) {
        return null;
      }
      return searchArray[index];
    });

    logic.add_operation("stringReplace", (inputString: string, searchString: string, replaceString: string): string => {
      if (inputString !== null && inputString !== undefined) {
        return inputString.replace(searchString, replaceString);
      }
      return "";
    });

    logic.add_operation("split", (stringToSplit: string, splitBy: string): string[] => {
      return stringToSplit.split(splitBy);
    });

    logic.add_operation("join", (stringArray: string[], seperator: string): string => {
      if (stringArray === null && stringArray === undefined && !Array.isArray(stringArray)) {
        return "";
      }
      if (stringArray === null || stringArray === undefined || !Array.isArray(stringArray)) {
        return "";
      }
      return stringArray.join(seperator);
    });

    const createICalFile = (startDate?: Date, endDate?: Date, summary?: string, description?: string, bodyContent?: string, categories?: string[]): void => {
      const content = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Events Calendar//HSHSOFT 1.0//DE
VERSION;2.0
BEGIN:VEVENT
${categories !== null && categories !== undefined ? "Categories:" + categories.join(",") : ""}
DTSTART:${startDate !== null && startDate !== undefined ? dayjs(startDate).format("YYYYMMDDTHHmmss") : null}
DTEND:${endDate !== null && endDate !== undefined ? dayjs(endDate).format("YYYYMMDDTHHmmss") : null}
SUMMARY:${summary !== null && summary !== undefined ? summary : ""}
DESCRIPTION:${description !== null && description !== undefined ? description : ""}
CLASS:PRIVATE
X-ALT-DESC;FMTTYPE=text/html:<!doctype html><html><body>${bodyContent !== null && bodyContent !== undefined ? bodyContent : ""}</body></html>
END:VEVENT
END:VCALENDAR`;

      const element = document.createElement("a");
      element.setAttribute("target", "_blank");
      element.style.display = "none";
      element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
      element.setAttribute("download", "termin.ics");
      element.click();
    };

    logic.add_operation("createCalendarFile", (startDate?: Date, endDate?: Date, title?: string, description?: string, bodyContent?: string, categories?: string[]) => {
      createICalFile(startDate, endDate, title, description, bodyContent, categories);
    });

    logic.add_operation("currentUserCanWrite", () => {
      return ctx().permissionInfo.currentUserCanWrite();
    });

    logic.add_operation("closeForm", () => {
      ctx().listItemContext.closeForm();
    });

    logic.add_operation("openStatusFlow", (data: IGraphDataResponseDto, windowTitle?: string) => {
      ctx().listItemContext.showStatusFlow(data, windowTitle);
    });

    logic.add_operation("createOptionsObjects", (arrayWithObjects: any[], propertyNameOfTextField: string, propertyNameOfKeyField: string): TextKeyChoice[] => {
      if (arrayWithObjects === undefined || arrayWithObjects === null || !Array.isArray(arrayWithObjects)) {
        return [];
      }
      return arrayWithObjects.map((o) => {
        return {
          key: o[propertyNameOfKeyField],
          text: o[propertyNameOfTextField],
          data: o
        };
      });
    });

    logic.add_operation("restoreFormDefaults", (...ignoreFieldNames: string[]) => {
      ctx().listItemContext.restoreFormDefaults(ignoreFieldNames);
    });

    logic.add_operation("sortObjects", (objectsToSort: any[], propertyNameToSortBy: string): any[] => {
      if (!Array.isArray(objectsToSort)) {
        return objectsToSort;
      }
      const result = objectsToSort.sort((a, b): number => {
        const aToCompare = a[propertyNameToSortBy];
        const bToCompare = b[propertyNameToSortBy];

        if (aToCompare < bToCompare) return -1;
        if (aToCompare == bToCompare) return 0;
        return 1;
      });
      return result;
    });

    const createObject = (...keyValueArray: any[]): any => {
      const keyValueCount = keyValueArray.length - (keyValueArray.length % 2);
      const objectToReturn: any = {};
      for (let i = 0; i < keyValueCount; i += 2) {
        try {
          const key = keyValueArray[i];
          const val = keyValueArray[i + 1];
          objectToReturn[key] = val;
        } catch (e) {
          log.error("JSONLogic createObject could not get executed");
          return objectToReturn;
        }
      }
      return objectToReturn;
    };

    logic.add_operation("createObject", createObject);

    logic.add_operation("validateForm", () => {
      const hasErrors = ctx().listItemContext.applyValidationRules();
      return hasErrors === false;
    });

    logic.add_operation("replaceHtmlTokens", (htmlWithTokens: string): string => {
      const dataObjectForPlaceHolder = mapListItemToObject(ctx().listItemContext.getListItem());
      const replacedHtml = format(htmlWithTokens, dataObjectForPlaceHolder);
      return replacedHtml;
    });

    logic.add_operation("queryContains", (queryParameterName: string, value: string): boolean => {
      const params = new URLSearchParams(window.location.search);
      if (params.has(queryParameterName)) {
        const valFromQuery = params.get(queryParameterName);
        return valFromQuery == value;
      }
      return false;
    });

    logic.add_operation("createArray", (...valuesForArray: any[]): any[] => {
      return valuesForArray;
    });

    logic.add_operation("count", (value: any): number => {
      if (Array.isArray(value)) {
        return value.length;
      }
      if (typeof value === "string") {
        return value.length;
      }
      return 0;
    });

    logic.add_operation("sum", (values: any): number => {
      if (!Array.isArray(values)) {
        return 0;
      }
      return values.reduce((acc: number, value: any) => {
        const numericValue = typeof value === "number" ? value : Number(value);
        if (Number.isFinite(numericValue)) {
          return acc + numericValue;
        }
        return acc;
      }, 0);
    });

    logic.add_operation("mergeDataIntoItems", (items: any[], propertyName: string, data: any): any[] => {
      if (items !== null && items !== undefined) {
        return items.map((i) => ({
          ...i,
          [propertyName]: data // füge hinzu, ohne das Original zu verändern
        }));
      }
      return items;
    });

    return logic;
  };
}
