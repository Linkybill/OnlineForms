import { useRef } from "react";
import { FieldDescription } from "../../listItem/fields/base/FieldDescription";
import { FieldValueTypes } from "../../listItem/types/FieldValueTypes";

export interface FieldManagement {
  addFields: (fields: FieldDescription<FieldValueTypes>[]) => void;
  addField: (field: FieldDescription<FieldValueTypes>) => void;
  getField: (name: string) => FieldDescription<FieldValueTypes> | undefined;
  clearFields: () => void;
}
export const useFieldManagement = (): FieldManagement => {
  const fieldsGroupedByName = useRef<{ [type: string]: FieldDescription<FieldValueTypes> }>({});

  return {
    addFields: function (fields: FieldDescription<FieldValueTypes>[]): void {
      fields.forEach((field) => {
        fieldsGroupedByName.current[field.internalName] = field;
      });
    },
    addField: function (field: FieldDescription<FieldValueTypes>): void {
      fieldsGroupedByName.current[field.internalName] = field;
    },
    getField: function (name: string): FieldDescription<FieldValueTypes> | undefined {
      return fieldsGroupedByName.current[name];
    },
    clearFields: function (): void {
      fieldsGroupedByName.current = {};
    }
  };
};
