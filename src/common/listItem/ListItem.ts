import log from "loglevel";
import { FieldDescriptionTypes } from "./types/FieldDescriptionTypes";
import { FieldValueTypes } from "./types/FieldValueTypes";
import { FieldDescription } from "./fields/base/FieldDescription";
import { ListItemField } from "./fields/base/ListItemField";
import { FieldTypeNames } from "./FieldTypeNames";
import { FieldNameRenderer } from "@pnp/spfx-controls-react";

export class ListItem {
  public ID: number | undefined = undefined;
  public Guid: string = undefined;
  public ContentTypeId: string | undefined = undefined;
  public rawRowFromSharePoint: any[] = [];
  private propertyNames: string[] = [];
  public requestedFieldSchema: FieldDescription<FieldValueTypes>[] = [];

  public constructor(itemId: number) {
    this.ID = itemId;
    const idFieldDescription: FieldDescriptionTypes = {
      defaultValue: undefined,
      description: "",
      displayName: "ID",
      internalName: "ID",
      required: false,
      type: FieldTypeNames.Number,
      uniqueKey: "ID",
      isReadOnly: true
    };
    this.addProperty({
      description: idFieldDescription,
      rawSharePointData: undefined,
      value: itemId
    });
  }
  private propertiesGroupedByInternalName: {
    [internalName: string]: ListItemField<FieldDescriptionTypes, FieldValueTypes>;
  } = {};

  public addProperties(props: ListItemField<FieldDescriptionTypes, FieldValueTypes>[]): void {
    props.forEach((prop) => this.addProperty(prop));
  }

  public addProperty = (property: ListItemField<FieldDescriptionTypes, FieldValueTypes>): void => {
    if (this.propertiesGroupedByInternalName[property.description.internalName] === undefined) {
      if (property.validationErrors === undefined || property.validationErrors === null) {
        property.validationErrors = [];
      }
      this.propertyNames.push(property.description.internalName);
      this.propertiesGroupedByInternalName[property.description.internalName] = property;
    }
  };

  public getProperty = (internalName: string): ListItemField<FieldDescriptionTypes, FieldValueTypes> => {
    return this.propertiesGroupedByInternalName[internalName];
  };

  public getProperties = (): ListItemField<FieldDescriptionTypes, FieldValueTypes>[] => {
    const propsToReturn = this.propertyNames.map((name) => this.propertiesGroupedByInternalName[name]);

    return propsToReturn;
  };

  public setValue(fieldName: string, value: FieldValueTypes): void {
    this.propertiesGroupedByInternalName[fieldName].value = value;
    this.propertiesGroupedByInternalName[fieldName].valueChanged = true;
  }

  public markFieldsAsNotChanged(): void {
    this.propertyNames.forEach((fieldName) => {
      this.propertiesGroupedByInternalName[fieldName].valueChanged = false;
    });
  }

  public setErrors(fieldName: string, errors: string[]) {
    if (this.propertiesGroupedByInternalName[fieldName] === undefined) {
      log.warn("can not set error of property " + fieldName, errors);
    } else {
      this.propertiesGroupedByInternalName[fieldName].validationErrors = errors;
    }
  }

  public getChangedProperties() {
    return this.propertyNames.filter((propName) => this.propertiesGroupedByInternalName[propName].valueChanged === true).map((propName) => this.propertiesGroupedByInternalName[propName]);
  }
}
