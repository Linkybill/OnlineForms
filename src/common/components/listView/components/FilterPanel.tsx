import { ActionButton, Checkbox, Panel, Stack, TextField } from "@fluentui/react";
import log from "loglevel";
import React, { useState } from "react";
import { IFilterManager } from "../interfaces/IFilterManager";
import { IListViewManager } from "../interfaces/IListViewManager";
import { mapPropertyToFilterStringRepresentation } from "../mapper/ListItemPropertyToFilterStringMapper";
import { Field } from "../models/Field";
import { ErrorMessage } from "./ErrorMessage";
import { ListItem } from "../../../listItem/ListItem";
import { FieldDescriptionTypes } from "../../../listItem/types/FieldDescriptionTypes";

export interface IFilterPanelProps {
  filterField: FieldDescriptionTypes;
  listViewManager: IListViewManager;
  filterManager: IFilterManager;
  alreadyFilteredValues: string[];
  onClose: () => void;
  fieldDescriptions: FieldDescriptionTypes[];
}

export const FilterPanel: (props: IFilterPanelProps) => JSX.Element = (props: IFilterPanelProps) => {
  const [filterItems, setFilterItems] = useState<ListItem[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  const loadFilter = async (event: any, newValue: string | undefined) => {
    const items = await props.listViewManager.getFilterProposals(props.filterField, newValue ? newValue : "", props.fieldDescriptions);

    setFilterItems(items.model.result);
    setError(items.error);
  };

  const checkBoxes: JSX.Element[] = [];
  const createCheckBox = (filterValue: string, checked: boolean): JSX.Element => {
    const key = "filter_" + props.filterField.internalName + "_" + filterValue;
    log.debug("creating checkbox with ", { key: key, value: filterValue });
    return (
      <>
        <Checkbox
          label={filterValue}
          key={key}
          checked={checked}
          onChange={(event: any, checked: boolean | undefined) => {
            if (checked) {
              props.filterManager.addFilter(props.filterField.internalName, filterValue, props.filterField.type);
            } else {
              props.filterManager.removeFilter(props.filterField.internalName, filterValue);
            }
          }}
        />
      </>
    );
  };
  props.alreadyFilteredValues.forEach((alreadyFilteredValue) => {
    checkBoxes.push(createCheckBox(alreadyFilteredValue, true));
  });

  // todo: move this code into a manager?
  if (filterItems !== undefined) {
    const filterValuesWhichHaveAlreadyACheckbox: {
      [filterValue: string]: boolean;
    } = {};
    filterItems.forEach((item) => {
      const filteredItemProperty = item.getProperty(props.filterField.internalName);
      const filterRepresentationStrings = mapPropertyToFilterStringRepresentation(filteredItemProperty);
      filterRepresentationStrings.forEach((filterValue) => {
        if (props.alreadyFilteredValues.indexOf(filterValue) === -1 && filterValuesWhichHaveAlreadyACheckbox[filterValue] === undefined) {
          checkBoxes.push(createCheckBox(filterValue, false));
          filterValuesWhichHaveAlreadyACheckbox[filterValue] = true;
        }
      });
    });
  }

  log.debug("rendering filterpanel with", {
    headerText: props.filterField.displayName,
    checkBoxes: checkBoxes,
    fieldBeingFiltered: props.filterField
  });

  return (
    <>
      <Panel key="filterPanel" headerText={"Filter " + props.filterField.displayName} isOpen={true} hasCloseButton={true} onDismiss={props.onClose} closeButtonAriaLabel="ok" isBlocking={false}>
        <ErrorMessage error={error}></ErrorMessage>

        <h1>Filter {props.filterField.displayName}</h1>
        <TextField key="filterPanelText" label="text eingeben um Wert zu filtern" onChange={loadFilter} />
        <Stack key="filterPanelStack" tokens={{ childrenGap: 10 }}>
          {checkBoxes}
          <ActionButton text="schließen" label="schließen" title="schließen" key="filterPanelCloseButton" onClick={props.onClose} />
        </Stack>
      </Panel>
    </>
  );
};
