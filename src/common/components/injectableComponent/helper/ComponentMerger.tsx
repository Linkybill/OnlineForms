import { IComponentReactConfig } from "../../componentProxy/models/IComponentReactConfig";
import { ComponentConfig } from "../../componentProxy/models/componentConfig";
import { componentNames } from "../../componentProxy/models/componentNames";
import { ComponentGridConfig } from "../../grid/models/componentGridConfig";
import { IComponentGridProps } from "../../grid/models/componentGridProps";
import { ComponentGridRow } from "../../grid/models/componentGridRow";
import { IInjectableComponent } from "../models/InjectableComponent";
import React from "react";
import { ListItem } from "../../../listItem/ListItem";

export const MergeComponentConfig = (
  givenConfig: ComponentConfig,
  keyForWrappedConfig: string,
  givenInjectableComponents: IInjectableComponent[],
  currentListItem: ListItem,
  onListItemChanged: (listItem: ListItem) => void
): ComponentConfig => {
  if (givenInjectableComponents.length === 0) {
    return givenConfig;
  }
  const startRows: ComponentGridRow[] = [];
  const endRows: ComponentGridRow[] = [];

  givenInjectableComponents.forEach((component, index) => {
    const mappedGridRow = mapInjectableComponentToComponentGridRow(component, "injectableComponent_" + index, currentListItem, onListItemChanged);
    if (component.position === "start") {
      startRows.push(mappedGridRow);
    } else {
      endRows.push(mappedGridRow);
    }
  });

  const wrappedRow: ComponentGridRow = {
    cells: [
      {
        uniqueIdentifier: "wrappedRow",
        widths: { smWidth: 12 },
        componentConfig: givenConfig
      }
    ]
  };
  const wrapperGridConfig: ComponentGridConfig = {
    rows: [...startRows, wrappedRow, ...endRows]
  };
  const componentGridProps: IComponentGridProps = {
    gridConfig: wrapperGridConfig,
    uniqueKey: keyForWrappedConfig
  };
  return {
    name: componentNames.componentGrid,
    props: componentGridProps
  };
};

const mapInjectableComponentToComponentGridRow = (component: IInjectableComponent, uniqueKey: string, currentListItem: ListItem, onListItemChanged: (listItem: ListItem) => void): ComponentGridRow => {
  const reactComponentProps: IComponentReactConfig = {
    uniqueKey: uniqueKey,
    content: (
      <div style={{ marginTop: 15, marginBottom: 15 }}>
        <component.Render currentListItem={currentListItem} onListItemChanged={onListItemChanged}></component.Render>
      </div>
    )
  };
  return {
    cells: [
      {
        uniqueIdentifier: "wrappedRow2",
        widths: { smWidth: 12 },
        componentConfig: {
          props: reactComponentProps,
          name: componentNames.reactComponent
        }
      }
    ]
  };
};
