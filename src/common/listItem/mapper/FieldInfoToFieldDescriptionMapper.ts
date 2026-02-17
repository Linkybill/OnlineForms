import { FieldUserSelectionMode, IFieldInfo } from "@pnp/sp/fields";
import log from "loglevel";

import { StaticFieldNames } from "../FieldTypeNames";
import { FieldDescriptionTypes } from "../types/FieldDescriptionTypes";
import { BooleanFieldDescription } from "../fields/booleanField/BooleanFieldDescription";
import { CurrencyFieldDescription } from "../fields/currencyField/CurrencyFieldDescription";
import { DateTimeFieldDescription, DateTimeDisplayMode } from "../fields/dateTimeField/DateTimeFieldDescription";
import { ChoiceFieldDescription } from "../fields/choiceField/ChoiceFieldDescription";
import { FileFieldDescription } from "../fields/fileField/FileFieldDescription";
import { LookupFieldDescription } from "../fields/lookupField/LookupFieldDescription";
import { NoteFieldDescription } from "../fields/noteField/NoteFieldDescription";
import { NumberFieldDescription } from "../fields/numberField/NumberFieldDescription";
import { TextFieldDescription } from "../fields/textField/TextFieldDescription";
import { UrlFieldDescription } from "../fields/urlField/UrlFieldDescription";
import { UserFieldDescription } from "../fields/userField/UserFieldDescription";

export enum ChoiceRenderType {
  dropDown = 0,
  radios = 1
}

export class FieldInfoToFieldDescriptionMapper {
  public static mapFieldInfoToFieldDescription(fieldInfo: IFieldInfo): FieldDescriptionTypes {
    switch (fieldInfo.TypeAsString) {
      case "Number":
        return this.mapFieldInfoToNumberFieldDescription(fieldInfo);

      case "Lookup":
        return this.mapFieldInfoToLookupFieldDescription(fieldInfo);

      case "LookupMulti":
        return this.mapFieldInfoToMultiLookupFieldDescription(fieldInfo);

      case "Boolean":
        return this.mapFieldInfoToBooleanFieldDescription(fieldInfo);
      case "Text":
        return this.mapFieldInfoToTextFieldDescription(fieldInfo);

      case "Choice":
        return this.mapFieldInfoToDropDownFieldDescription(fieldInfo);

      case "MultiChoice":
        return this.mapFieldInfoToDropDownFieldDescriptionWithMultipleSelectionsEnabled(fieldInfo);

      case "DateTime":
        return this.mapFieldInfoToDateTimeFieldDescription(fieldInfo);

      case "User":
        return this.mapFieldInfoToUserFieldDescription(fieldInfo, false);

      case "UserMulti":
        return this.mapFieldInfoToUserFieldDescription(fieldInfo, true);

      case "URL": // TODO: check, which type is äquivalent
        return this.mapFieldInfoToUrlFieldDescription(fieldInfo);
      case "Note":
        return this.mapFieldInfoToNoteFieldDescription(fieldInfo);
      case "Currency":
        return this.mapFieldInfoToCurrencyFieldDescription(fieldInfo);
      case "Computed":
        return this.mapFieldInfoToSupportedComputedDescriptions(fieldInfo);
      case "WorkflowStatus":
        return this.mapFieldInfoToTextFieldDescription(fieldInfo);

      default:
        log.warn("found not supported fieldtype in FieldInfoToFieldDescriptionMapper", fieldInfo);
        return this.mapFieldInfoToNotSupportedField(fieldInfo);
    }
  }
  static mapFieldInfoToNotSupportedField(fieldInfo: IFieldInfo): TextFieldDescription {
    return {
      isReadOnly: true,
      defaultValue: fieldInfo.DefaultValue !== null ? fieldInfo.DefaultValue.toString() : "",
      displayName: fieldInfo.Title + " !!! Not Supported type in schema mapping: " + fieldInfo.TypeAsString,
      internalName: fieldInfo.InternalName,
      required: false,
      type: fieldInfo.TypeAsString,
      description: fieldInfo.Description,
      uniqueKey: fieldInfo.InternalName
    };
  }

  private static mapFieldInfoToNumberFieldDescription(field: IFieldInfo): NumberFieldDescription {
    const defaultValue: string = field.DefaultValue !== null ? field.DefaultValue : "";

    return {
      isReadOnly: field.ReadOnlyField,
      defaultValue: defaultValue,
      displayName: field.Title,
      internalName: field.InternalName,
      required: field.Required,
      type: field.TypeAsString,
      description: field.Description,
      inputSuffix: "%",
      numberOfDecimals: field["DisplayFormat"].toString() === "-1" ? "auto" : field["DisplayFormat"],
      uniqueKey: field.InternalName
    };
  }

  private static mapFieldInfoToSupportedComputedDescriptions(field: IFieldInfo): FieldDescriptionTypes {
    switch (field.StaticName) {
      case StaticFieldNames.LinkFilename:
      case StaticFieldNames.LinkFilenameNoMenu:
      case StaticFieldNames.DocIcon:
        const fieldFileDescription: FileFieldDescription = {
          defaultValue: {} as any,
          isReadOnly: true,
          description: field.Description,
          displayName: field.Title,
          internalName: field.InternalName,
          required: false,
          type: field.TypeAsString,
          uniqueKey: field.InternalName
        };
        return fieldFileDescription;
    }
    return this.mapFieldInfoToNotSupportedField(field);
  }

  private static mapFieldInfoToLookupFieldDescription(field: IFieldInfo): LookupFieldDescription {
    return this.mapFieldInfoToSingDemorMultiLookupFieldDescription(field as any, false);
  }

  private static mapFieldInfoToMultiLookupFieldDescription(field: IFieldInfo): LookupFieldDescription {
    return this.mapFieldInfoToSingDemorMultiLookupFieldDescription(field as any, true);
  }

  private static mapFieldInfoToSingDemorMultiLookupFieldDescription(field: IFieldInfo, canSelectMultipleItems: boolean): LookupFieldDescription {
    return {
      isReadOnly: field.ReadOnlyField,
      defaultValue: [], // lookup does not have any default values
      displayName: field.Title,
      internalName: field.InternalName,
      required: field.Required,
      type: field.TypeAsString,
      canSelectMultipleItems: canSelectMultipleItems,
      lookupField: (field as any).LookupField,
      lookupListId: (field as any).LookupList,
      lookupWebId: (field as any).LookupWebId,
      description: (field as any).Description,
      uniqueKey: field.InternalName
    };
  }
  private static mapFieldInfoToBooleanFieldDescription(field: IFieldInfo): BooleanFieldDescription {
    log.warn("we still need to check default values for lookups");

    const defaultValue: boolean | undefined = field.DefaultValue === "1" ? true : field.DefaultValue === null ? undefined : false;

    return {
      isReadOnly: field.ReadOnlyField,
      defaultValue: defaultValue,
      displayName: field.Title,
      internalName: field.InternalName,
      required: field.Required,
      type: field.TypeAsString,
      description: field.Description,
      uniqueKey: field.InternalName
    };
  }

  private static mapFieldInfoToTextFieldDescription(field: IFieldInfo): TextFieldDescription {
    return {
      isReadOnly: field.ReadOnlyField,
      defaultValue: field.DefaultValue !== null ? field.DefaultValue : "",
      displayName: field.Title,
      internalName: field.InternalName,
      required: field.Required,
      type: field.TypeAsString,
      description: field.Description,
      uniqueKey: field.InternalName
    };
  }

  private static mapFieldInfoToDropDownFieldDescriptionWithMultipleSelectionsEnabled(field: IFieldInfo): ChoiceFieldDescription {
    return this.mapFieldInfoToDropDownFieldDescriptionWithMultipDemorSingleSelection(field, true);
  }

  private static mapFieldInfoToDropDownFieldDescription(field: IFieldInfo): ChoiceFieldDescription {
    const renderType: ChoiceRenderType = (field as any)["EditFormat"];
    const multipleSelectionsEnabled = renderType === ChoiceRenderType.radios ? true : false;

    return this.mapFieldInfoToDropDownFieldDescriptionWithMultipDemorSingleSelection(field, multipleSelectionsEnabled);
  }
  private static mapFieldInfoToDropDownFieldDescriptionWithMultipDemorSingleSelection(field: IFieldInfo, multipleSelectionsEnabled: boolean): ChoiceFieldDescription {
    let defaultValue: string[] = [];
    if (field.DefaultValue !== null && field.DefaultValue !== "") {
      log.debug("Default value for Dropdown: " + field.InternalName, field);
      // todo check if this is correct with default value
      // todo: extract value mappings for choices into a helper or something?
      let defaultValueWithoutStartAndEndTags: string = field.DefaultValue;
      if (defaultValueWithoutStartAndEndTags.startsWith(";#")) {
        defaultValueWithoutStartAndEndTags = defaultValueWithoutStartAndEndTags.substring(2);
      }
      if (defaultValueWithoutStartAndEndTags.endsWith(";#")) {
        defaultValueWithoutStartAndEndTags = defaultValueWithoutStartAndEndTags.substring(0, defaultValueWithoutStartAndEndTags.length - 2);
      }
      defaultValue = defaultValueWithoutStartAndEndTags.split(";#");
    }

    log.debug("default value for dropdown mapped to", defaultValue);
    const choices = (field as any)["Choices"];
    const fillInChoiceEnabled = (field as any)["FillInChoice"];
    return {
      formulaForChoices: "",
      isReadOnly: field.ReadOnlyField,
      choices: choices,
      defaultValue: defaultValue,
      displayName: field.Title,
      enableMultipleSelections: multipleSelectionsEnabled,
      fillInChoiceEnabled: fillInChoiceEnabled,
      internalName: field.InternalName,
      required: field.Required,
      type: field.TypeAsString,
      description: field.Description,
      uniqueKey: field.InternalName,
      representation: "Dropdown"
    };
  }

  private static mapFieldInfoToDateTimeFieldDescription(field: IFieldInfo): DateTimeFieldDescription {
    let defaultValue: Date | undefined = undefined;
    log.debug("mapping description for datetime field with title " + field.InternalName + " ", field);
    if (field.DefaultValue !== null && field.DefaultValue !== "") {
      log.debug("Defaultvalue for datetime field ", field.DefaultValue);
      if (field.DefaultValue === "[today]") {
        defaultValue = new Date();
      } else {
        defaultValue = new Date(field.DefaultValue as string);
      }
    }

    return {
      isReadOnly: field.ReadOnlyField,
      defaultValue: defaultValue !== undefined ? { date: defaultValue, time: defaultValue } : undefined,
      displayName: field.Title,
      internalName: field.InternalName,
      required: false,
      type: field.TypeAsString,
      description: field.Description,
      displayMode: (field as any)["DisplayFormat"] === 0 || (field as any)["DisplayFormat"] === "0" ? DateTimeDisplayMode.DateOnly : DateTimeDisplayMode.DateAndTime,
      uniqueKey: field.InternalName
    };
  }

  private static mapFieldInfoToUserFieldDescription(fieldInfo: IFieldInfo, canSelectMultipleUsers: boolean): UserFieldDescription {
    if (fieldInfo.DefaultValue !== null) {
      log.debug("Defaultvalue for userfield ", fieldInfo.DefaultValue);
    }

    const group: number = (fieldInfo as any)["SelectionGroup"];
    const userSelectionMode = (fieldInfo as any)["SelectionMode"];

    const allowGroupSelection: boolean = userSelectionMode === FieldUserSelectionMode.PeopleOnly ? false : true;

    // todo: integrate default values for People Fields
    return {
      isReadOnly: fieldInfo.ReadOnlyField,
      allowGroupSelection: allowGroupSelection,
      canSelectMultipleItems: canSelectMultipleUsers,
      defaultValue: [],
      displayName: fieldInfo.Title,
      groupId: group,
      internalName: fieldInfo.InternalName,
      required: fieldInfo.Required,
      type: fieldInfo.TypeAsString,
      description: fieldInfo.Description,
      uniqueKey: fieldInfo.InternalName
    };
  }

  private static mapFieldInfoToUrlFieldDescription(field: IFieldInfo): UrlFieldDescription {
    // todo: check how default value from sharepoint looks like
    if (field.DefaultValue !== null) {
      log.debug("Defaultvalue for Url ", field.DefaultValue);
    }

    const urlFieldDescription: UrlFieldDescription = {
      isReadOnly: field.ReadOnlyField,
      defaultValue: undefined,
      displayName: field.Title,
      internalName: field.InternalName,
      required: field.Required,
      type: field.TypeAsString,
      isImageUrl: (field as any)["DisplayFormat"] === 1,
      description: field.Description,
      uniqueKey: field.InternalName
    };
    return urlFieldDescription;
  }

  private static mapFieldInfoToNoteFieldDescription(field: IFieldInfo): NoteFieldDescription {
    log.debug("mapping field " + field.Title + "to notefield", field);
    // todo: check how default value from sharepoint looks like
    if (field.DefaultValue !== null) {
      log.debug("Defaultvalue for note ", field.DefaultValue);
    }

    const noteFieldDescription: NoteFieldDescription = {
      isReadOnly: field.ReadOnlyField,
      defaultValue: "",
      displayName: field.Title,
      internalName: field.InternalName,
      required: field.Required,
      type: field.TypeAsString,
      description: field.Description,
      numberOfLines: (field as any).NumberOfLines,
      fullHtml: (field as any).RichText,
      uniqueKey: field.InternalName
    };
    return noteFieldDescription;
  }

  private static mapFieldInfoToCurrencyFieldDescription(field: IFieldInfo): CurrencyFieldDescription {
    // todo: check how default value from sharepoint looks like
    if (field.DefaultValue !== null) {
      log.debug("Defaultvalue for currency ", field.DefaultValue);
    }

    const description: CurrencyFieldDescription = {
      isReadOnly: field.ReadOnlyField,
      defaultValue: "",
      displayName: field.Title,
      internalName: field.InternalName,
      required: field.Required,
      type: field.TypeAsString,
      description: field.Description,
      numberOfDecimals: (field as any).DisplayFormat,
      currencyLocaleId: (field as any).CurrencyLocaleId,
      uniqueKey: field.InternalName
    };
    return description;
  }
}
