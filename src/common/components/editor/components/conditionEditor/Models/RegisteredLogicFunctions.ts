import { IDropdownOption, SelectableOptionMenuItemType } from "@fluentui/react";
import { OperationValidationRule } from "./OperationValidationModel";
import log from "loglevel";

export const registeredLogicFunctionChoiceDropDowns: IDropdownOption<OperationValidationRule>[] = [
  { key: "AccessingData", text: "Data access", itemType: SelectableOptionMenuItemType.Header },
  { key: "AccessingDataDivider2", text: "", itemType: SelectableOptionMenuItemType.Divider },
  {
    key: "var",
    text: "var",
    data: {
      helpText: "",
      minNumberOfParameters: 1,
      maxNumberOfParameters: 1,
      expectedParameters: [{ description: "Path to the property of the current object", type: "string" }],
      operationName: "var",
      returnTypeName: "any"
    }
  },
  {
    key: "missing",
    text: "missing",
    data: {
      helpText: "Takes an array of data keys and checks if the keys are present in the data. If not, the missing keys are returned.",
      minNumberOfParameters: 1,
      maxNumberOfParameters: undefined,
      expectedParameters: [{ description: "A data key which gets checked in data", type: "string" }],
      expectedParametersTemplate: { description: "A data key which gets checked in data", type: "string" },
      operationName: "missing",
      returnTypeName: "string",
      url: "https://jsonlogic.com/operations.html#missing"
    }
  },
  {
    key: "missing_some",
    text: "missing_some",
    data: {
      operationName: "missing_some",
      returnTypeName: "array",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      helpText: "Takes a minimum number of data keys that are required, and an array of keys to search for. Returns an empty array if the minimum is met, or an array of the missing keys otherwise.",
      expectedParameters: [{ description: "Required number", type: "number" }],
      url: "https://jsonlogic.com/operations.html#missing_some"
    }
  },
  { key: "LogicAndBooleanOperationsDivider1", text: "", itemType: SelectableOptionMenuItemType.Divider },
  { key: "LogicAndBooleanOperationsHeader", text: "Logic and Boolean Operations", itemType: SelectableOptionMenuItemType.Header },
  { key: "LogicAndBooleanOperationsDivider2", text: "", itemType: SelectableOptionMenuItemType.Divider },
  {
    key: "if",
    text: "if",
    data: {
      minNumberOfParameters: 3,
      maxNumberOfParameters: 3,
      helpText: "",
      expectedParameters: [
        { type: "boolean", description: "" },
        { type: "any", description: "Parameter taken for true" },
        { type: "any", description: "Parameter taken for false" }
      ],
      operationName: "if",
      returnTypeName: "any",
      url: "https://jsonlogic.com/operations.html#if"
    }
  },
  {
    key: "==",
    text: "==",
    data: {
      helpText: "",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      expectedParameters: [
        { type: "any", description: "" },
        { type: "any", description: "" }
      ],
      operationName: "==",
      returnTypeName: "boolean",
      url: "https://jsonlogic.com/operations.html#"
    }
  },
  {
    key: "===",
    text: "===",
    data: {
      helpText: "",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      expectedParameters: [
        { type: "any", description: "" },
        { type: "any", description: "" }
      ],
      operationName: "===",
      returnTypeName: "boolean",
      url: "https://jsonlogic.com/operations.html"
    }
  },
  {
    key: "!=",
    text: "!=",
    data: {
      helpText: "",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      expectedParameters: [
        { type: "any", description: "" },
        { type: "any", description: "" }
      ],
      operationName: "!=",
      returnTypeName: "boolean",
      url: "https://jsonlogic.com/operations.html"
    }
  },
  {
    key: "!==",
    text: "!==",
    data: {
      helpText: "",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      expectedParameters: [
        { type: "any", description: "" },
        { type: "any", description: "" }
      ],
      operationName: "!==",
      returnTypeName: "boolean",
      url: "https://jsonlogic.com/operations.html"
    }
  },
  {
    key: "!",
    text: "!",
    data: {
      helpText: "",
      minNumberOfParameters: 1,
      maxNumberOfParameters: 1,
      expectedParameters: [{ type: "boolean", description: "" }],
      operationName: "!",
      returnTypeName: "boolean",
      url: "https://jsonlogic.com/operations.html"
    }
  },
  {
    key: "!!",
    text: "!!",
    data: {
      helpText: "",
      minNumberOfParameters: 1,
      maxNumberOfParameters: 1,
      expectedParameters: [{ type: "any", description: "" }],
      operationName: "!!",
      returnTypeName: "boolean",
      url: "https://jsonlogic.com/operations.html"
    }
  },
  {
    key: "or",
    text: "or",
    data: {
      helpText: "",
      minNumberOfParameters: 1,
      maxNumberOfParameters: undefined,
      expectedParameters: [{ type: "boolean", description: "" }],
      expectedParametersTemplate: { type: "boolean", description: "" },
      operationName: "or",
      returnTypeName: "boolean",
      url: "https://jsonlogic.com/operations.html#or"
    }
  },
  {
    key: "and",
    text: "and",
    data: {
      helpText: "",
      minNumberOfParameters: 1,
      maxNumberOfParameters: undefined,
      expectedParameters: [{ type: "boolean", description: "" }],
      operationName: "and",
      returnTypeName: "boolean",
      url: "https://jsonlogic.com/operations.html#and"
    }
  },
  { key: "NumericOperationsDivider1", text: "", itemType: SelectableOptionMenuItemType.Divider },
  { key: "NumericOperationsHeader", text: "Numeric Operations", itemType: SelectableOptionMenuItemType.Header },
  { key: "NumericOperationsDivider2", text: "", itemType: SelectableOptionMenuItemType.Divider },
  {
    key: "<",
    text: "<",
    data: {
      helpText: "",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      expectedParameters: [
        { type: "number", description: "" },
        { type: "number", description: "" },
        { type: "number", description: "" }
      ],
      operationName: "<",
      returnTypeName: "boolean",
      url: "https://jsonlogic.com/operations.html#---and-"
    }
  },
  {
    key: "<=",
    text: "<=",
    data: {
      helpText: "",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      expectedParameters: [
        { type: "any", description: "" },
        { type: "any", description: "" },
        { type: "number", description: "" }
      ],
      operationName: "<=",
      returnTypeName: "boolean",
      url: "https://jsonlogic.com/operations.html#---and-"
    }
  },
  {
    key: ">",
    text: ">",
    data: {
      helpText: "",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      expectedParameters: [
        { type: "any", description: "" },
        { type: "any", description: "" }
      ],
      operationName: ">",
      returnTypeName: "boolean",
      url: "https://jsonlogic.com/operations.html#---and-"
    }
  },
  {
    key: ">=",
    text: ">=",
    data: {
      helpText: "",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      expectedParameters: [
        { type: "any", description: "" },
        { type: "any", description: "" }
      ],
      operationName: ">=",
      returnTypeName: "boolean",
      url: "https://jsonlogic.com/operations.html#---and-"
    }
  },
  {
    key: "max",
    text: "max",
    data: {
      helpText: "",
      minNumberOfParameters: 1,
      maxNumberOfParameters: undefined,
      expectedParameters: [{ type: "number", description: "" }],
      expectedParametersTemplate: { type: "number", description: "" },
      operationName: "max",
      returnTypeName: "number",
      url: "https://jsonlogic.com/operations.html#max-and-min"
    }
  },
  {
    key: "min",
    text: "min",
    data: {
      helpText: "",
      minNumberOfParameters: 1,
      maxNumberOfParameters: undefined,
      expectedParameters: [{ type: "number", description: "" }],
      expectedParametersTemplate: { type: "number", description: "" },
      operationName: "min",
      returnTypeName: "number",
      url: "https://jsonlogic.com/operations.html#max-and-min"
    }
  },
  {
    key: "+",
    text: "+",
    data: {
      helpText: "",
      minNumberOfParameters: 2,
      maxNumberOfParameters: undefined,
      expectedParameters: [
        { type: "number", description: "" },
        { type: "number", description: "" }
      ],
      expectedParametersTemplate: { type: "number", description: "" },
      operationName: "+",
      returnTypeName: "number",
      url: "https://jsonlogic.com/operations.html#arithmetic-----"
    }
  },
  {
    key: "-",
    text: "-",
    data: {
      helpText: "",
      minNumberOfParameters: 2,
      maxNumberOfParameters: undefined,
      expectedParameters: [
        { type: "number", description: "" },
        { type: "number", description: "" }
      ],
      expectedParametersTemplate: { type: "number", description: "" },
      operationName: "-",
      returnTypeName: "number",
      url: "https://jsonlogic.com/operations.html#arithmetic-----"
    }
  },
  {
    key: "*",
    text: "*",
    data: {
      helpText: "",
      minNumberOfParameters: 2,
      maxNumberOfParameters: undefined,
      expectedParameters: [
        { type: "number", description: "" },
        { type: "number", description: "" }
      ],
      expectedParametersTemplate: { type: "number", description: "" },
      operationName: "*",
      returnTypeName: "number",
      url: "https://jsonlogic.com/operations.html#arithmetic-----"
    }
  },
  {
    key: "/",
    text: "/",
    data: {
      helpText: "",
      minNumberOfParameters: 2,
      maxNumberOfParameters: undefined,
      expectedParameters: [
        { type: "number", description: "" },
        { type: "number", description: "" }
      ],
      expectedParametersTemplate: { type: "number", description: "" },
      operationName: "/",
      returnTypeName: "number",
      url: "https://jsonlogic.com/operations.html#arithmetic-----"
    }
  },
  {
    key: "%",
    text: "%",
    data: {
      helpText: "",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      expectedParameters: [
        { type: "number", description: "" },
        { type: "number", description: "" }
      ],
      operationName: "%",
      returnTypeName: "number",
      url: "https://jsonlogic.com/operations.html#%25"
    }
  },
  {
    key: "map",
    text: "map",
    data: {
      helpText: "Applies a function to each element in an array and returns a new array with the results.",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      parameterPickerResolutionInformationCanBeFoundAtParameterIndex: 0,
      parameterPickerResolutionShouldApplyForParameters: [1],
      parameterPickerResolutionStopsRecursion: true,
      expectedParameters: [
        { description: "Array to iterate over", type: "array" },
        { description: "Function to apply to each element", type: "any" }
      ],
      operationName: "map",
      returnTypeName: "array",
      url: "https://jsonlogic.com/operations.html#map-reduce-and-filter"
    }
  },
  {
    key: "reduce",
    text: "reduce",
    data: {
      helpText: "Reduces an array to a single value by applying a function to each element and accumulating the result.",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      expectedParameters: [
        { description: "Array to iterate over", type: "array" },
        { description: "Function to apply to each element", type: "any" }
      ],
      operationName: "reduce",
      returnTypeName: "any",
      url: "https://jsonlogic.com/operations.html#map-reduce-and-filter"
    }
  },
  {
    key: "filter",
    text: "filter",
    data: {
      helpText: "Filters elements in an array based on a function that returns true or false for each element.",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      parameterPickerResolutionShouldApplyForParameters: [1],
      parameterPickerResolutionInformationCanBeFoundAtParameterIndex: 0,
      expectedParameters: [
        { description: "Array to iterate over", type: "array" },
        { description: "Function to test each element", type: "any" }
      ],
      operationName: "filter",
      returnTypeName: "array",
      url: "https://jsonlogic.com/operations.html#map-reduce-and-filter"
    }
  },
  {
    key: "all",
    text: "all",
    data: {
      helpText: "Returns true if all elements in an array satisfy a condition.",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      parameterPickerResolutionInformationCanBeFoundAtParameterIndex: 0,
      parameterPickerResolutionShouldApplyForParameters: [1],
      expectedParameters: [
        { description: "Array to iterate over", type: "array" },
        { description: "Function to test each element", type: "any" }
      ],
      operationName: "all",
      returnTypeName: "boolean",
      url: "https://jsonlogic.com/operations.html#all-none-and-some"
    }
  },
  {
    key: "none",
    text: "none",
    data: {
      helpText: "Returns true if no elements in an array satisfy a condition.",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      parameterPickerResolutionInformationCanBeFoundAtParameterIndex: 0,
      parameterPickerResolutionShouldApplyForParameters: [1],
      expectedParameters: [
        { description: "Array to iterate over", type: "array" },
        { description: "Function to test each element", type: "any" }
      ],
      operationName: "none",
      returnTypeName: "boolean",
      url: "https://jsonlogic.com/operations.html#all-none-and-some"
    }
  },
  {
    key: "some",
    text: "some",
    data: {
      helpText: "Returns true if at least one element in an array satisfies a condition.",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      parameterPickerResolutionInformationCanBeFoundAtParameterIndex: 0,
      parameterPickerResolutionShouldApplyForParameters: [1],

      expectedParameters: [
        { description: "Array to iterate over", type: "array" },
        { description: "Function to test each element", type: "any" }
      ],
      operationName: "some",
      returnTypeName: "boolean",
      url: "https://jsonlogic.com/operations.html#all-none-and-some"
    }
  },
  {
    key: "merge",
    text: "merge",
    data: {
      helpText: "Merges multiple arrays into one.",
      minNumberOfParameters: 1,
      maxNumberOfParameters: undefined,
      expectedParameters: [{ description: "Arrays to merge", type: "array" }],
      expectedParametersTemplate: { description: "Arrays to merge", type: "array" },
      operationName: "merge",
      returnTypeName: "array",
      url: "https://jsonlogic.com/operations.html#merge"
    }
  },
  {
    key: "createArray",
    text: "createArray",
    data: {
      helpText: "creates an array",
      minNumberOfParameters: 1,
      maxNumberOfParameters: undefined,
      expectedParameters: [{ description: "object to be part of array", type: "any" }],
      expectedParametersTemplate: { description: "object to be part of array", type: "any" },
      operationName: "createArray",
      returnTypeName: "array"
    }
  },
  {
    key: "in",
    text: "in",
    data: {
      helpText: "Checks if a value exists in an array.",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      expectedParameters: [
        { description: "Value to check", type: "any" },
        { description: "Array or string to check against", type: "any" }
      ],
      operationName: "in",
      returnTypeName: "boolean",
      url: "https://jsonlogic.com/operations.html#in"
    }
  },
  {
    key: "count",
    text: "count",
    data: {
      helpText: "Gibt die Anzahl der Elemente in einem Array oder die Länge eines Strings zurück.",
      minNumberOfParameters: 1,
      maxNumberOfParameters: 1,
      expectedParameters: [{ description: "Array oder String", type: "any" }],
      operationName: "count",
      returnTypeName: "number"
    }
  },
  {
    key: "sum",
    text: "Sum / Aufsummieren",
    data: {
      helpText: "Summiert alle Zahlen in einem Array.",
      minNumberOfParameters: 1,
      maxNumberOfParameters: 1,
      expectedParameters: [{ description: "Array mit Zahlen", type: "array" }],
      operationName: "sum",
      returnTypeName: "number"
    }
  },
  {
    key: "mergeDataIntoItems",
    text: "mergeDataIntoItems",
    data: {
      helpText: "Iterates over the items and adds a property with the given name which contains the given data.",
      minNumberOfParameters: 3,
      maxNumberOfParameters: 3,
      expectedParameters: [
        { description: "Array with Objects", type: "array" },
        { description: "Name of the property, which should contain the data", type: "string" },
        { description: "Data, which should be placed into items", type: "any" }
      ],
      operationName: "mergeDataIntoItems",
      returnTypeName: "array"
    }
  },
  { key: "StringOperationsDivider1", text: "", itemType: SelectableOptionMenuItemType.Divider },
  { key: "StringOperationsHeader", text: "String Operations", itemType: SelectableOptionMenuItemType.Header },
  { key: "StringOperationsDivider2", text: "", itemType: SelectableOptionMenuItemType.Divider },
  {
    key: "cat",
    text: "cat",
    data: {
      helpText: "Concatenates multiple strings into one.",
      minNumberOfParameters: 2,
      maxNumberOfParameters: undefined,
      expectedParameters: [{ description: "Strings to concatenate", type: "string" }],
      expectedParametersTemplate: { description: "Strings to concatenate", type: "string" },

      operationName: "cat",
      returnTypeName: "string",
      url: "https://jsonlogic.com/operations.html#cat"
    }
  },
  {
    key: "substr",
    text: "substr",
    data: {
      helpText: "Extracts a substring from a string.",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 3,
      expectedParameters: [
        { description: "String to extract from", type: "string" },
        { description: "Start position", type: "number" },
        { description: "Length of substring", type: "number" }
      ],
      operationName: "substr",
      returnTypeName: "string",
      url: "https://jsonlogic.com/operations.html#substr"
    }
  },
  { key: "MiscDivider1", text: "", itemType: SelectableOptionMenuItemType.Divider },
  { key: "MIscHeader", text: "Miscellaneous", itemType: SelectableOptionMenuItemType.Header },
  { key: "MiscDivider2", text: "", itemType: SelectableOptionMenuItemType.Divider },
  {
    key: "log",
    text: "log",
    data: {
      helpText: "Logs a value to the console.",
      minNumberOfParameters: 1,
      maxNumberOfParameters: 1,
      expectedParameters: [{ description: "Value to log", type: "any" }],
      operationName: "log",
      returnTypeName: "void",
      url: "https://jsonlogic.com/operations.html#misc"
    }
  },
  {
    key: "currentUserLoginName",
    text: "Aktueller Benutzername",

    data: {
      helpText: "Returns the current users login name.",
      minNumberOfParameters: 0,
      maxNumberOfParameters: 0,
      expectedParameters: [],
      operationName: "currentUserLoginName",
      returnTypeName: "string"
    }
  },
  {
    key: "currentDate",
    text: "Aktuelle Datum",
    data: {
      helpText: "Returns the current date.",
      minNumberOfParameters: 0,
      maxNumberOfParameters: 0,
      expectedParameters: [],
      operationName: "currentDate",
      returnTypeName: "date"
    }
  },
  {
    key: "formatDate",
    text: "Datum ausgeben",
    data: {
      helpText: "Formats a date as a string.",
      minNumberOfParameters: 1,
      maxNumberOfParameters: 2,
      expectedParameters: [
        { description: "Date to format", type: "date" },
        { description: "format string, (Supports year: YYYYY, Monat: MM, Tag: DD, Stunde: HH, Minute:mm, Sekunde: ss)", type: "string" }
      ],
      operationName: "formatDate",
      returnTypeName: "string"
    }
  },
  {
    key: "formatDateTime",
    text: "Datum mit Uhrzeit ausgeben",
    data: {
      helpText: "Formats a date and time as a string.",
      minNumberOfParameters: 1,
      maxNumberOfParameters: 2,
      expectedParameters: [
        { description: "Date to format", type: "date" },
        { description: "format string, (Supports year: YYYYY, Monat: MM, Tag: DD, Stunde: HH, Minute:mm, Sekunde: ss)", type: "string" }
      ],
      operationName: "formatDateTime",
      returnTypeName: "string"
    }
  },
  {
    key: "formatTime",
    text: "Uhrzeit ausgeben",
    data: {
      helpText: "Formats a time as a string.",
      minNumberOfParameters: 1,
      maxNumberOfParameters: 1,
      expectedParameters: [{ description: "Time to format", type: "date" }],
      operationName: "formatTime",
      returnTypeName: "string"
    }
  },
  {
    key: "dateOnly",
    text: "DateOnly",
    data: {
      helpText: "Creates a date object with only the date component, stripping the time.",
      minNumberOfParameters: 1,
      maxNumberOfParameters: 1,
      expectedParameters: [{ description: "Date to process", type: "date" }],
      operationName: "dateOnly",
      returnTypeName: "date"
    }
  },
  {
    key: "addToDate",
    text: "Tage, Stunden, Minuten zu Datum hinzufügen",
    data: {
      helpText: "Adds days, hours, and minutes to a date.",
      minNumberOfParameters: 4,
      maxNumberOfParameters: 4,
      expectedParameters: [
        { description: "Date to modify", type: "date" },
        { description: "Days to add", type: "number" },
        { description: "Hours to add", type: "number" },
        { description: "Minutes to add", type: "number" }
      ],
      operationName: "addToDate",
      returnTypeName: "date"
    }
  },
  {
    key: "currentUserId",
    text: "Aktuelle Benutzer Loginname",
    data: {
      helpText: "Returns the current user's login name.",
      minNumberOfParameters: 0,
      maxNumberOfParameters: 0,
      expectedParameters: [],
      operationName: "currentUserId",
      returnTypeName: "string"
    }
  },
  {
    key: "currentWebUrl",
    text: "Aktuelle WebUrl",
    data: {
      helpText: "Returns the current web URL.",
      minNumberOfParameters: 0,
      maxNumberOfParameters: 0,
      expectedParameters: [],
      operationName: "currentWebUrl",
      returnTypeName: "string"
    }
  },
  {
    key: "currentSiteCollectionUrl",
    text: "Aktuelle SiteCollectionUrl",
    data: {
      helpText: "Returns the current site collection URL.",
      minNumberOfParameters: 0,
      maxNumberOfParameters: 0,
      expectedParameters: [],
      operationName: "currentSiteCollectionUrl",
      returnTypeName: "string"
    }
  },

  {
    key: "urlEncode",
    text: "Url kodieren",
    data: {
      helpText: "Encodes a URL string.",
      minNumberOfParameters: 1,
      maxNumberOfParameters: 1,
      expectedParameters: [{ description: "String to encode", type: "string" }],
      operationName: "urlEncode",
      returnTypeName: "string"
    }
  },
  {
    key: "createGuid",
    text: "CreateGuid",
    data: {
      helpText: "Creates a new GUID.",
      minNumberOfParameters: 0,
      maxNumberOfParameters: 0,
      expectedParameters: [],
      operationName: "createGuid",
      returnTypeName: "string"
    }
  },
  {
    key: "indexOf",
    text: "Index of",
    data: {
      helpText: "Returns the index of a value in an array.",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      expectedParameters: [
        { description: "Array to search", type: "array" },
        { description: "Value to find", type: "any" }
      ],
      operationName: "indexOf",
      returnTypeName: "number"
    }
  },
  {
    key: "join",
    text: "Join stringarray with separator",
    data: {
      helpText: "Joins elements of an array into a string with a separator.",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      expectedParameters: [
        { description: "Array to join", type: "array" },
        { description: "Separator to use", type: "string" }
      ],
      operationName: "join",
      returnTypeName: "string"
    }
  },
  {
    key: "split",
    text: "split a string by separator, returns an array of strings",
    data: {
      helpText: "Splits a string by a separator into an array of strings.",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      expectedParameters: [
        { description: "String to split", type: "string" },
        { description: "Separator to use", type: "string" }
      ],
      operationName: "split",
      returnTypeName: "array"
    }
  },
  {
    key: "stringReplace",
    text: "String replace",
    data: {
      helpText: "",
      minNumberOfParameters: 3,
      maxNumberOfParameters: 3,
      expectedParameters: [
        { type: "string", description: "String to search" },
        { type: "string", description: "Search string" },
        { type: "string", description: "Replacement string" }
      ],
      operationName: "stringReplace",
      returnTypeName: "string"
    }
  },
  {
    key: "replaceHtmlTokens",
    text: "Platzhalter aus HTML ersetzen",
    data: {
      helpText: "",

      minNumberOfParameters: 1,
      maxNumberOfParameters: 1,
      expectedParameters: [{ type: "string", description: "HTML string to replace tokens" }],
      operationName: "replaceHtmlTokens",
      returnTypeName: "string"
    }
  },
  {
    key: "createCalendarFile",
    text: "Kalendereintrag erzeugen",
    data: {
      helpText: "",

      minNumberOfParameters: 6,
      maxNumberOfParameters: 6,
      expectedParameters: [
        { type: "date", description: "Start date of the calendar event" },
        { type: "date", description: "End date of the calendar event" },
        { type: "string", description: "Event title" },
        { type: "string", description: "Event location" },
        { type: "string", description: "Event description" },
        { type: "array", description: "Attendees of the event" }
      ],
      operationName: "replaceHtmlTokens",
      returnTypeName: "string"
    }
  },
  {
    key: "hostUrl",
    text: "Host Url",
    data: {
      helpText: "",

      minNumberOfParameters: 0,
      maxNumberOfParameters: 0,
      expectedParameters: [],
      operationName: "hostUrl",
      returnTypeName: "string"
    }
  },
  {
    key: "validateForm",
    text: "Formular validieren",
    data: {
      helpText: "",

      minNumberOfParameters: 0,
      maxNumberOfParameters: 0,
      expectedParameters: [],
      operationName: "validateForm",
      returnTypeName: "boolean"
    }
  },
  {
    key: "closeForm",
    text: "Formular schließen",
    data: {
      helpText: "",

      minNumberOfParameters: 0,
      maxNumberOfParameters: 0,
      expectedParameters: [],
      operationName: "closeForm",
      returnTypeName: "undefined"
    }
  },
  {
    key: "currentUserCanWrite",
    text: "Benutzer hat schreibrechte?",
    data: {
      minNumberOfParameters: 0,
      maxNumberOfParameters: 0,
      helpText: "",

      expectedParameters: [],
      operationName: "currentUserCanWrite",
      returnTypeName: "boolean"
    }
  },
  {
    key: "openStatusFlow",
    text: "Formularstatus anzeigen",

    data: {
      helpText: "",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      expectedParameters: [
        { type: "any", description: "Status to display" },
        { type: "string", description: "Flow name" }
      ],
      operationName: "openStatusFlow",
      returnTypeName: "void"
    }
  },
  {
    key: "queryContains",
    text: "Urlquery enthält Parameter",
    data: {
      helpText: "",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      expectedParameters: [
        { type: "string", description: "URL string to check" },
        { type: "string", description: "Query parameter to search for" }
      ],
      operationName: "queryContains",
      returnTypeName: "boolean"
    }
  },
  {
    key: "createObject",
    text: "Objekt erstellen",
    data: {
      helpText: "",
      minNumberOfParameters: 2,
      maxNumberOfParameters: undefined,
      expectedParameters: [
        { type: "string", description: "Object type" },
        { type: "any", description: "Object data" }
      ],
      operationName: "createObject",
      returnTypeName: "any"
    }
  },
  {
    key: "createOptionsObjects",
    text: "Optionsobjekte für Auswahllisten erstellen",
    data: {
      helpText: "",
      minNumberOfParameters: 3,
      maxNumberOfParameters: 3,
      parameterPickerResolutionInformationCanBeFoundAtParameterIndex: 0,
      parameterPickerResolutionShouldApplyForParameters: [1, 2],

      expectedParameters: [
        { type: "array", description: "List of options" },
        { type: "string", description: "Label for the options" },
        { type: "string", description: "Value for the options" }
      ],
      operationName: "createOptionsObjects",
      returnTypeName: "array"
    }
  },
  {
    key: "restoreFormDefaults",
    text: "Formular Defaultwerte wieder herstellen",
    data: {
      helpText: "Stellt defaults aller Felder im Form wieder her und ignoriert dabei die Feldnamen, die im Übergabeparameter angegeben sind.",
      minNumberOfParameters: 1,
      maxNumberOfParameters: undefined,
      expectedParameters: [{ type: "string", description: "internalNames der Felder, die ignoriert werden sollen" }],
      expectedParametersTemplate: { type: "string", description: "internalNames der Felder, die ignoriert werden sollen" },
      operationName: "restoreFormDefaults",
      returnTypeName: "any"
    }
  },
  {
    key: "sortObjects",
    text: "sortObjects",
    data: {
      helpText: "sorts the array with Objects given by the property name to sort",
      minNumberOfParameters: 2,
      maxNumberOfParameters: 2,
      parameterPickerResolutionInformationCanBeFoundAtParameterIndex: 0,
      parameterPickerResolutionShouldApplyForParameters: [1],
      expectedParameters: [
        { description: "array of Objects which needs to be sorted", type: "array" },
        { description: "Propertyname within the objects, which should get sorted", type: "string" }
      ],

      operationName: "sortObjects",
      returnTypeName: "array"
    }
  }
];

export const getLogicOperationValidationModel = (functionName: string): OperationValidationRule => {
  var model = registeredLogicFunctionChoiceDropDowns.filter((d) => d.data !== undefined && d.data.operationName === functionName);
  if (model.length === 0) {
    log.error("das validation model für die logic function " + functionName + " wurde nicht gefunden");
    return {
      expectedParameters: [],
      helpText: "Invalid function",
      minNumberOfParameters: 0,
      operationName: "invalid function",
      maxNumberOfParameters: undefined,
      returnTypeName: "string",
      modelIsInvalid: true
    };
  }
  return model[0].data;
};
