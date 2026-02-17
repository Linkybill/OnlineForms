import React from "react";
import { useListItemContext } from "../helper/ListItemContext";
import { TextKeyChoice } from "../listItem/fields/choiceField/ChoiceFieldDescription";
import { DropDownField } from "../listItem/fields/choiceField/dropdownField/DropDownField";
import { FieldTypeNames } from "../listItem/FieldTypeNames";

export const FormFieldSelector = (props: { internalName: string; label: string; description: string; onSelectionChanged(value: string[]): void; canSelectMultipleFields: boolean; selectedFieldNames: string[] }) => {
  const listItemContext = useListItemContext();
  const choicesForFieldDropdown: TextKeyChoice[] = listItemContext
    .getListItem()
    .getProperties()
    .map((prop) => {
      return {
        key: prop.description.internalName,
        text: prop.description.displayName
      };
    });

  return (
    <>
      <DropDownField
        onBlur={() => {}}
        rawData={""}
        renderAsTextOnly={false}
        validationErrors={[]}
        editMode={true}
        fieldDescription={{
          formulaForChoices: "",
          choices: choicesForFieldDropdown.map((c) => c.key),
          textKeyChoices: choicesForFieldDropdown,
          defaultValue: [],
          description: props.description,
          displayName: props.label,
          enableMultipleSelections: false,
          fillInChoiceEnabled: false,
          internalName: props.internalName,
          required: true,
          type: FieldTypeNames.Choice,
          uniqueKey: "Field_" + props.internalName
        }}
        fieldValue={props.selectedFieldNames}
        onValueChanged={(field, value) => {
          if (typeof value[0] == "string") {
            props.onSelectionChanged(value as string[]);
          }
        }}></DropDownField>{" "}
    </>
  );
};
