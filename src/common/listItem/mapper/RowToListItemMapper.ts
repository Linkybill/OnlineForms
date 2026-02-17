import { ISPFieldLookupValue } from "@pnp/spfx-controls-react";
import log from "loglevel";
import { FieldTypeNames, StaticFieldNames } from "../FieldTypeNames";
import { ListItem } from "../ListItem";
import { FieldDescriptionTypes } from "../types/FieldDescriptionTypes";
import { FieldValueTypes } from "../types/FieldValueTypes";
import { ListItemDefaultValue } from "../types/ListItemDefaultValue";
import { ListItemField } from "../fields/base/ListItemField";
import { BooleanFieldDescription } from "../fields/booleanField/BooleanFieldDescription";
import { BooleanFieldProperty } from "../fields/booleanField/BooleanFieldProperty";
import { CurrencyFieldDescription } from "../fields/currencyField/CurrencyFieldDescription";
import { CurrencyFieldProperty } from "../fields/currencyField/CurrencyFieldProperty";
import { DateTimeFieldDescription } from "../fields/dateTimeField/DateTimeFieldDescription";
import { DateTimeFieldProperty } from "../fields/dateTimeField/DateTimeFieldProperty";
import { ChoiceFieldDescription } from "../fields/choiceField/ChoiceFieldDescription";
import { ChoiceFieldProperty } from "../fields/choiceField/ChoiceFieldProperty";
import { FileFieldDescription } from "../fields/fileField/FileFieldDescription";
import { FileFieldProperty } from "../fields/fileField/FileFieldProperty";
import { ListFieldDescription } from "../fields/listField/ListFieldDescription";
import { ListFieldProperty } from "../fields/listField/ListFieldProperty";
import { LookupFieldDescription } from "../fields/lookupField/LookupFieldDescription";
import { LookupFieldProperty } from "../fields/lookupField/LookupFieldProperty";
import { NoteFieldDescription } from "../fields/noteField/NoteFieldDescription";
import { NoteFieldProperty } from "../fields/noteField/NoteFieldProperty";
import { NumberFieldDescription } from "../fields/numberField/NumberFieldDescription";
import { NumberFieldProperty } from "../fields/numberField/NumberFieldProperty";
import { TextFieldDescription } from "../fields/textField/TextFieldDescription";
import { TextFieldProperty } from "../fields/textField/TextFieldProperty";
import { UrlFieldDescription } from "../fields/urlField/UrlFieldDescription";
import { UrlFieldProperty } from "../fields/urlField/UrlFieldProperty";
import { UserFieldDescription } from "../fields/userField/UserFieldDescription";
import { UserFieldProperty } from "../fields/userField/UserFieldProperty";
import { LookupValue } from "../fields/valueTypes/LookupValue";
import { UrlValue } from "../fields/valueTypes/UrlValue";
import { UserFieldValue } from "../fields/valueTypes/UserFieldValue";
import { CustomFieldCreatorFieldProperty } from "../fields/customFieldListField/CustomFieldListProperty";
import { CustomFieldListFieldDescription } from "../fields/customFieldListField/CustomFieldListFieldDescription";
import { WebPickerFieldProperty } from "../fields/webPickerField/WebPickerFieldProperty";
import { WebPickerFieldDescription } from "../fields/webPickerField/WebPickerFieldDescription";
import { ListPickerFieldProperty } from "../fields/ListPickerField.tsx/ListPickerFieldProperty";
import { ListPickerFieldDescription } from "../fields/ListPickerField.tsx/ListPickerFieldDescription";
import { ButtonFieldProperty } from "../fields/buttonField/ButtonFieldProperty";
import { BUttonFieldDescription } from "../fields/buttonField/ButtonFieldDescription";
import { LogicEditorFieldProperty } from "../fields/LogicEditorField/LogicEditorFieldProperty";
import { LogicEditorFieldDescription } from "../fields/LogicEditorField/LogicEditorFieldDescription";
import { DateTimeValue } from "../fields/dateTimeField/DateTimeValue";
import { TemplateEditorFieldProperty } from "../fields/templateEditorField/TemplateEditorFieldProperty";
import { TemplateEditorFieldDescription } from "../fields/templateEditorField/TemplateEditorFieldDescription";
import { CustomTemplatedListFieldProperty } from "../fields/customTemplatedListField/CustomTemplatedListFieldProperty";
import { CustomTemplatedListFieldDescription } from "../fields/customTemplatedListField/CustomTemplatedListFieldDescription";
import { createFormTemplateBasedOnFields } from "../../helper/FormTemplateGenerator";
import { EditorModel } from "../../components/editor/models/EditorModel";
import { FileUploadFieldProperty } from "../fields/fileuploadField/FileUploadFieldProperty";
import { FileUploadFieldDescription } from "../fields/fileuploadField/FileUploadFieldDescription";
import { JSONDataFieldProperty } from "../fields/jsonDataField/JSONDataFieldProperty";
import { JSONDataFieldDescription } from "../fields/jsonDataField/JSONDataFieldDescription";

export class RowToListItemMapper {
  private static mapToFileFieldProperty = (description: FieldDescriptionTypes, row: any): ListItemField<FieldDescriptionTypes, FieldValueTypes> => {
    try {
      let progId = (row as any)["serverurl.progid"] as string;
      if (progId == undefined || progId == null) {
        progId = (row as any)["Progid"] as string;
      }
      const url = progId !== null && progId !== undefined ? progId.replace("1http:", "http:").replace("1https:", "https:") : "";
      const fileFieldProperty: FileFieldProperty = {
        description: description as FileFieldDescription,
        rawSharePointData: row,
        value: {
          showAsLink: true,
          title: (row as any)["Title"],
          fileName: (row as any)["FileLeafRef"],
          url: url
        }
      };
      log.debug("mapping field to file property,", description.displayName, fileFieldProperty);

      return fileFieldProperty;
    } catch (e) {
      log.error(e);
      throw e;
    }
  };

  public static mapRowToListItems(rows: any[], fieldDescriptions: FieldDescriptionTypes[]): ListItem[] {
    log.debug("trying to map rows to listitems", {
      rows: rows,
      fieldDescriptions: fieldDescriptions
    });
    const items = rows.map((row) => {
      const item = new ListItem(Number.parseInt(row.ID));
      item.rawRowFromSharePoint = row;
      item.ContentTypeId = (row as any)["ContentTypeId"];
      item.requestedFieldSchema = fieldDescriptions;
      fieldDescriptions.forEach((description) => {
        if (description.internalName !== "ID") {
          const mappedProps = this.mapToProperty(description, row);
          item.addProperty(mappedProps);
        }
      });

      return item;
    });
    return items;
  }

  public static mapFieldDescriptionsToDefaultListItem(descriptions: FieldDescriptionTypes[], contentTypeId: string, injectedDefaultValues: ListItemDefaultValue[]): ListItem {
    const listItem = new ListItem(undefined);

    listItem.ContentTypeId = contentTypeId;
    log.debug("creating default ListItem", {
      descriptions: descriptions,
      contentTypeId: contentTypeId,
      injectedDefaultValues: injectedDefaultValues
    });
    descriptions.forEach((description) => {
      const injectedDefaultValueArray = injectedDefaultValues.filter((val) => val.fieldName === description.internalName);

      const injectedDefaultValueString = injectedDefaultValueArray.length > 0 ? injectedDefaultValueArray[0].fieldValue : undefined;

      switch (description.type) {
        case FieldTypeNames.FormTemplaeEditor: {
          const prop: TemplateEditorFieldProperty = {
            description: description as TemplateEditorFieldDescription,
            rawSharePointData: "",
            value: description.defaultValue !== undefined ? (description.defaultValue as EditorModel) : (createFormTemplateBasedOnFields([]) as EditorModel)
          };
          listItem.addProperty(prop);
          break;
        }
        case FieldTypeNames.Boolean: {
          const defaultVal = injectedDefaultValueString === undefined ? description.defaultValue : injectedDefaultValueString;
          const normalized =
            defaultVal === undefined || defaultVal === null
              ? undefined
              : defaultVal === true ||
                defaultVal === 1 ||
                defaultVal === "1" ||
                defaultVal === "true" ||
                defaultVal === "True" ||
                defaultVal === "Ja"
              ? true
              : defaultVal === false || defaultVal === 0 || defaultVal === "0" || defaultVal === "false" || defaultVal === "False" || defaultVal === "Nein"
              ? false
              : undefined;

          const prop: BooleanFieldProperty = {
            description: description as BooleanFieldDescription,
            rawSharePointData: description.defaultValue,
            value: normalized
          };

          listItem.addProperty(prop);
          break;
        }
        case FieldTypeNames.Choice:
        case FieldTypeNames.MultiChoice: {
          const prop: ChoiceFieldProperty = {
            description: description as ChoiceFieldDescription,
            rawSharePointData: description.defaultValue,
            value: description.defaultValue as string[]
          };
          listItem.addProperty(prop);
          break;
        }
        case FieldTypeNames.DateTime: {
          const prop: DateTimeFieldProperty = {
            description: description as DateTimeFieldDescription,
            rawSharePointData: description.defaultValue,

            value: description.defaultValue as DateTimeValue | undefined
          };
          listItem.addProperty(prop);
          break;
        }

        case FieldTypeNames.Lookup:
        case FieldTypeNames.LookupMulti: {
          const prop: LookupFieldProperty = {
            description: description as LookupFieldDescription,
            rawSharePointData: description.defaultValue,
            value: description.defaultValue as LookupValue[]
          };
          listItem.addProperty(prop);
          break;
        }

        case FieldTypeNames.Number: {
          const value =
            injectedDefaultValueString === undefined || injectedDefaultValueString === ""
              ? description.defaultValue !== undefined && description.defaultValue !== ""
                ? +description.defaultValue
                : ""
              : injectedDefaultValueString;
          const prop: NumberFieldProperty = {
            description: description as NumberFieldDescription,
            rawSharePointData: description.defaultValue,
            value: value
          };
          listItem.addProperty(prop);
          break;
        }
        case FieldTypeNames.Currency: {
          const value =
            injectedDefaultValueString === undefined || injectedDefaultValueString === ""
              ? description.defaultValue !== undefined && description.defaultValue !== ""
                ? +description.defaultValue
                : ""
              : injectedDefaultValueString;
          const prop: CurrencyFieldProperty = {
            description: description as CurrencyFieldDescription,
            rawSharePointData: description.defaultValue,
            value: value
          };
          listItem.addProperty(prop);
          break;
        }

        case FieldTypeNames.Text: {
          const prop: TextFieldProperty = {
            description: description as TextFieldDescription,
            rawSharePointData: description.defaultValue,
            value: injectedDefaultValueString === undefined ? (description.defaultValue as string) : injectedDefaultValueString
          };
          listItem.addProperty(prop);
          break;
        }
        case FieldTypeNames.Note: {
          const prop: NoteFieldProperty = {
            description: description as NoteFieldDescription,
            rawSharePointData: description.defaultValue,
            value: injectedDefaultValueString === undefined ? (description.defaultValue as string) : injectedDefaultValueString
          };
          listItem.addProperty(prop);
          break;
        }
        case FieldTypeNames.URL: {
          const prop: UrlFieldProperty = {
            description: description as UrlFieldDescription,
            rawSharePointData: description.defaultValue,
            value: description.defaultValue as UrlValue
          };
          listItem.addProperty(prop);
          break;
        }
        case FieldTypeNames.User:
        case FieldTypeNames.UserMulti: {
          const prop: UserFieldProperty = {
            description: description as UserFieldDescription,
            rawSharePointData: description.defaultValue,
            value: description.defaultValue as UserFieldValue[]
          };
          listItem.addProperty(prop);
          break;
        }
        case FieldTypeNames.List: {
          const prop: ListFieldProperty = {
            description: description as ListFieldDescription,
            rawSharePointData: description.defaultValue,
            value: description.defaultValue === undefined ? [] : (description.defaultValue as any[])
          };
          listItem.addProperty(prop);
          break;
        }
        case FieldTypeNames.CustomTemplatedEntity: {
          const prop: CustomTemplatedListFieldProperty = {
            description: description as CustomTemplatedListFieldDescription,
            rawSharePointData: description.defaultValue,
            value: description.defaultValue === undefined ? [] : (description.defaultValue as any[])
          };
          listItem.addProperty(prop);
          break;
        }
        case FieldTypeNames.CustomFieldList: {
          const prop: CustomFieldCreatorFieldProperty = {
            description: description as CustomFieldListFieldDescription,
            rawSharePointData: [],
            value: description.defaultValue as FieldDescriptionTypes[]
          };
          listItem.addProperty(prop);
          break;
        }
        case FieldTypeNames.WebPicker: {
          const prop: WebPickerFieldProperty = {
            description: description as WebPickerFieldDescription,
            rawSharePointData: [],
            value: description.defaultValue as string
          };
          listItem.addProperty(prop);
          break;
        }
        case FieldTypeNames.ListPicker: {
          const prop: ListPickerFieldProperty = {
            description: description as ListPickerFieldDescription,
            rawSharePointData: [],
            value: description.defaultValue as string
          };
          listItem.addProperty(prop);
          break;
        }
        case FieldTypeNames.Button: {
          const prop: ButtonFieldProperty = {
            description: description as BUttonFieldDescription,
            rawSharePointData: "",
            value: {
              isDisabled: false,
              isVisible: true,
              label: (description as BUttonFieldDescription).displayName,
              value: ""
            }
          };
          log.debug("add button property to listitem");

          listItem.addProperty(prop);
          break;
        }
        case FieldTypeNames.LogicEditor: {
          const prop: LogicEditorFieldProperty = {
            description: description as LogicEditorFieldDescription,
            rawSharePointData: "",
            value: ""
          };
          log.debug("add button property to listitem");

          listItem.addProperty(prop);
          break;
        }
        case FieldTypeNames.FileUpload: {
          const prop: FileUploadFieldProperty = {
            description: description as FileUploadFieldDescription,
            rawSharePointData: "",
            value: []
          };
          log.debug("add button property to listitem");

          listItem.addProperty(prop);
          break;
        }
        case FieldTypeNames.JSONData: {
          const prop: JSONDataFieldProperty = {
            description: description as JSONDataFieldDescription,
            rawSharePointData: "",
            value: {}
          };
          listItem.addProperty(prop);
        }
      }
    });

    log.debug("created default item: ", listItem);
    return listItem;
  }

  private static mapToProperty(description: FieldDescriptionTypes, row: any[]): ListItemField<FieldDescriptionTypes, FieldValueTypes> {
    const mapperFunctionsGroupedByFieldType: {
      [fieldType: string]: (description: any, row: any[]) => ListItemField<FieldDescriptionTypes, FieldValueTypes>;
    } = {};

    // todo: check field types, do they match the sharePoint specs?

    mapperFunctionsGroupedByFieldType[FieldTypeNames.Text] = this.mapToTextProperty;

    mapperFunctionsGroupedByFieldType[FieldTypeNames.Note] = this.mapToNoteProperty;
    mapperFunctionsGroupedByFieldType[FieldTypeNames.Lookup] = this.mapToLookupProperty;
    mapperFunctionsGroupedByFieldType[FieldTypeNames.LookupMulti] = this.mapToLookupProperty;

    mapperFunctionsGroupedByFieldType[FieldTypeNames.Number] = this.mapToNumberProperty;
    mapperFunctionsGroupedByFieldType[FieldTypeNames.User] = this.mapToUserProperty;
    mapperFunctionsGroupedByFieldType[FieldTypeNames.UserMulti] = this.mapToUserProperty;
    mapperFunctionsGroupedByFieldType[FieldTypeNames.Boolean] = this.mapToBooleanProperty;

    mapperFunctionsGroupedByFieldType[FieldTypeNames.Choice] = this.mapToChoiceProperty;
    mapperFunctionsGroupedByFieldType[FieldTypeNames.MultiChoice] = this.mapToChoiceProperty;
    mapperFunctionsGroupedByFieldType[FieldTypeNames.URL] = this.mapToUrlProperty;

    mapperFunctionsGroupedByFieldType[FieldTypeNames.DateTime] = this.mapToDateTimeProperty;

    mapperFunctionsGroupedByFieldType[FieldTypeNames.Currency] = this.mapToCurrencyProperty;

    mapperFunctionsGroupedByFieldType[FieldTypeNames.Computed] = this.mapToSupportedComputedFieldProperty.bind(this);
    mapperFunctionsGroupedByFieldType[FieldTypeNames.WorkflowStatus] = this.mapToTextProperty;
    mapperFunctionsGroupedByFieldType[FieldTypeNames.JSONData] = this.mapToJSONDataProperty;
    if (mapperFunctionsGroupedByFieldType[description.type] === undefined) {
      log.warn("found not supported fieldtype in RowToListItemMapper:", description);
      // not supported value
      const textField: TextFieldProperty = {
        value: "not supported",
        description: {
          defaultValue: "",
          displayName: description.displayName,
          internalName: description.internalName,
          required: false,
          type: description.type,
          description: description.description,
          uniqueKey: description.internalName
        },
        rawSharePointData: (row as any)[description.internalName]
      };
      return textField;
    }

    return mapperFunctionsGroupedByFieldType[description.type](description, row);
  }

  private static mapToTextProperty(description: TextFieldDescription, row: any[]): ListItemField<FieldDescriptionTypes, FieldValueTypes> {
    const textField: TextFieldProperty = {
      description: description,
      value: (row as any)[description.internalName],
      rawSharePointData: (row as any)[description.internalName]
    };
    return textField;
  }

  private static mapToLookupProperty(description: LookupFieldDescription, row: any[]): ListItemField<FieldDescriptionTypes, FieldValueTypes> {
    let lookupValues: LookupValue[] = [];
    if ((row as any)[description.internalName] !== null && (row as any)[description.internalName] !== undefined && (row as any)[description.internalName] !== "") {
      if (typeof (row as any)[description.internalName] === "string") {
        lookupValues = [
          {
            lookupId: -1,
            value: (row as any)[description.internalName]
          }
        ];
      } else {
        const spValue: ISPFieldLookupValue[] = (row as any)[description.internalName];

        lookupValues = spValue.map((spVal): LookupValue => {
          return {
            lookupId: Number.parseInt(spVal.lookupId),
            value: spVal.lookupValue
          };
        });
      }
    }

    const lookup: LookupFieldProperty = {
      description: description,
      value: lookupValues,
      rawSharePointData: (row as any)[description.internalName]
    };
    return lookup;
  }

  private static mapToNumberProperty(description: NumberFieldDescription, row: any[]): ListItemField<FieldDescriptionTypes, FieldValueTypes> {
    const numberField: NumberFieldProperty = {
      description: description,
      value: (row as any)[description.internalName],
      rawSharePointData: (row as any)[description.internalName]
    };
    return numberField;
  }

  private static mapToUserProperty(description: UserFieldDescription, row: any[]): ListItemField<FieldDescriptionTypes, FieldValueTypes> {
    log.debug("mapping userField from sharepoint", (row as any)[description.internalName]);

    const userFIeld: UserFieldProperty = {
      description: description,
      value: (row as any)[description.internalName] !== undefined && (row as any)[description.internalName] !== "" && (row as any)[description.internalName] !== null ? (row as any)[description.internalName] : [],
      rawSharePointData: (row as any)[description.internalName]
    };
    return userFIeld;
  }

  private static mapToBooleanProperty(description: BooleanFieldDescription, row: any[]): ListItemField<FieldDescriptionTypes, FieldValueTypes> {
    log.debug("mapping boolean from sharepoint", (row as any)[description.internalName], row);

    const booleanValue: boolean = (row as any)[description.internalName] === "Ja"; // todo: localisation?
    const field: BooleanFieldProperty = {
      description: description,
      value: booleanValue,
      rawSharePointData: (row as any)[description.internalName]
    };
    return field;
  }

  private static mapToChoiceProperty(description: ChoiceFieldDescription, row: any[]): ListItemField<FieldDescriptionTypes, FieldValueTypes> {
    log.debug("mapping boolean from sharepoint", (row as any)[description.internalName]);
    let value: string[] = [];

    if ((row as any)[description.internalName] !== null && (row as any)[description.internalName] !== undefined && (row as any)[description.internalName] !== "") {
      if (description.enableMultipleSelections) {
        value = (row as any)[description.internalName];
      } else {
        value.push((row as any)[description.internalName]);
      }
    }
    const field: ChoiceFieldProperty = {
      description: description,
      value: value,
      rawSharePointData: (row as any)[description.internalName]
    };
    return field;
  }
  private static mapToUrlProperty(description: UrlFieldDescription, row: any[]): ListItemField<FieldDescriptionTypes, FieldValueTypes> {
    const urlText = (row as any)[description.internalName + ".desc"];
    const url = (row as any)[description.internalName];
    const textField: UrlFieldProperty = {
      description: description,
      value: {
        text: urlText,
        url: url
      },
      rawSharePointData: (row as any)[description.internalName],
      validationErrors: []
    };
    return textField;
  }

  private static mapToDateTimeProperty(description: DateTimeFieldDescription, row: any[]): ListItemField<FieldDescriptionTypes, FieldValueTypes> {
    const sharePointValue = (row as any)[description.internalName + "."] || (row as any)[description.internalName];

    log.debug("going to map datevalue", sharePointValue);

    let dateValue: Date | undefined = undefined;
    if (sharePointValue !== undefined && sharePointValue !== null && sharePointValue !== "") {
      dateValue = new Date(sharePointValue);
      log.debug("mapped utc date string to date object " + description.internalName, {
        string: sharePointValue,
        date: dateValue
      });
    }

    const dateField: DateTimeFieldProperty = {
      description: description,
      value: {
        date: dateValue,
        time: dateValue
      },
      rawSharePointData: (row as any)[description.internalName]
    };
    return dateField;
  }

  private static mapToSupportedComputedFieldProperty(description: FieldDescriptionTypes, row: any): ListItemField<FieldDescriptionTypes, FieldValueTypes> {
    log.debug("going to map to supported computed fields , ", description.displayName, description);
    switch (description.internalName) {
      case StaticFieldNames.LinkFilenameNoMenu:
      case StaticFieldNames.LinkFilename:
      case StaticFieldNames.DocIcon:
        return this.mapToFileFieldProperty(description, row);
    }

    // not supported value
    const textField: TextFieldProperty = {
      value: "not supported",
      description: {
        isReadOnly: true,
        defaultValue: "",
        displayName: description.displayName,
        internalName: description.internalName,
        required: false,
        type: description.type,
        description: description.description,
        uniqueKey: description.internalName
      },
      rawSharePointData: (row as any)[description.internalName]
    };
    return textField;
  }

  private static mapToNoteProperty(description: NoteFieldDescription, row: any[]): ListItemField<FieldDescriptionTypes, FieldValueTypes> {
    const sharePointValue = (row as any)[description.internalName];

    log.debug("going to map noteValue", sharePointValue);

    let noteValue: string = "";
    if (sharePointValue !== undefined && sharePointValue !== null && sharePointValue !== "") {
      noteValue = sharePointValue;
    }
    const noteField: NoteFieldProperty = {
      description: description,
      value: noteValue,
      rawSharePointData: (row as any)[description.internalName]
    };
    return noteField;
  }

  private static mapToCurrencyProperty(description: CurrencyFieldDescription, row: any[]): ListItemField<FieldDescriptionTypes, FieldValueTypes> {
    const sharePointValue = (row as any)[description.internalName];

    log.debug("going to map curency value " + description.internalName, sharePointValue);

    let currencyValue: string = "";
    if (sharePointValue !== undefined && sharePointValue !== null && sharePointValue !== "") {
      currencyValue = sharePointValue;
    }
    const currencyProperty: CurrencyFieldProperty = {
      description: description,
      value: currencyValue,
      rawSharePointData: (row as any)[description.internalName]
    };
    return currencyProperty;
  }

  private static mapToJSONDataProperty(description: JSONDataFieldDescription, row: any[]): ListItemField<FieldDescriptionTypes, FieldValueTypes> {
    const jsonFieldProp: JSONDataFieldProperty = {
      description: description,
      value: (row as any)[description.internalName],
      rawSharePointData: (row as any)[description.internalName]
    };
    return jsonFieldProp;
  }
}
