import { ITag, TagPicker, Label } from "@fluentui/react";
import { useState } from "react";
import log from "loglevel";
import { LookupFieldDescription } from "./LookupFieldDescription";
import { LookupValue } from "../valueTypes/LookupValue";
import { IFieldComponentProps } from "../base/FieldComponentProps";
import { LookupFieldTextRepresentation } from "./LookupFieldTextRepresentation";
import * as React from "react";
import { managerFactory } from "../../../components/formcomponents/manager/createManager";
import { WithErrorsBottom } from "../../../components/errorComponent/WithErrorsBottom";

export interface ILookupFieldProps extends IFieldComponentProps<LookupFieldDescription, LookupValue[]> {}

export const LookupField = (props: ILookupFieldProps): JSX.Element => {
  const [error, setError] = useState<string | undefined>();
  const pickerId = "lookupPicker_" + props.fieldDescription.internalName;

  const lookupManager = managerFactory.createLookupFieldManager();

  log.debug("rendering lookup field " + props.fieldDescription.internalName + " with props ", props);

  // lookupValues format = 1;#Kunden/;#2;#Kunden/VertragskundenGeändert

  const getTextFromItem = (item: ITag) => item.name;

  const resolveSuggestions = async (filter: string): Promise<ITag[]> => {
    const result = await lookupManager.loadLookupSuggestions(props.fieldDescription.lookupWebId, props.fieldDescription.lookupListId, props.fieldDescription.lookupField, filter);
    if (result.error !== undefined) {
      setError(result.error);
      return [];
    }
    const tags: ITag[] = result.model.map((lookupValue): ITag => {
      return {
        key: lookupValue.id,
        name: lookupValue.value
      };
    });

    return tags;
  };

  if (props.renderAsTextOnly) {
    return <LookupFieldTextRepresentation description={props.fieldDescription} manager={lookupManager} lookupValues={props.fieldValue ? props.fieldValue : []}></LookupFieldTextRepresentation>;
  }

  return (
    <WithErrorsBottom errors={props.validationErrors}>
      <Label disabled={!props.editMode} htmlFor={pickerId}>
        {props.fieldDescription.internalName}
      </Label>
      {error !== undefined && <label>{error}</label>}
      <TagPicker
        disabled={props.editMode === false}
        onChange={(items) => {
          props.onValueChanged(
            props.fieldDescription,
            items?.map((item): LookupValue => {
              return {
                lookupId: item.key as number,
                value: item.name
              };
            })
          );
        }}
        removeButtonAriaLabel="Remove"
        selectionAriaLabel="Selected"
        onResolveSuggestions={resolveSuggestions}
        getTextFromItem={getTextFromItem}
        pickerSuggestionsProps={{
          loadingText: "Lade lookup values",
          suggestionsHeaderText: "Suggested values",
          noResultsFoundText: "No values found"
        }}
        itemLimit={props.fieldDescription.canSelectMultipleItems ? undefined : 1}
        // this option tells the picker's callout to render inline instead of in a new layer
        pickerCalloutProps={{ doNotLayer: false }}
        selectedItems={
          props.fieldValue !== undefined && props.fieldValue !== null
            ? props.fieldValue.map((lookup): ITag => {
                return {
                  key: lookup.lookupId,
                  name: lookup.value
                };
              })
            : []
        }
      />
    </WithErrorsBottom>
  );
};
