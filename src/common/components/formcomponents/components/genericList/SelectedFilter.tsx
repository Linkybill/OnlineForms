import { Breadcrumb, CommandBarButton, IBreadcrumbItem } from "@fluentui/react";
import * as React from "react";
import { Filter } from "../../../../dynamicFilter/models/Filter";

export interface ISelectedFilterProps {
  filter: Filter[];
  listName: string;
  onFilterRemove: (fieldNames: string[]) => void;
}
export const SelectedFilter: (props: ISelectedFilterProps) => JSX.Element = (props: ISelectedFilterProps) => {
  const items: IBreadcrumbItem[] = [];
  items.push({
    key: "filterHeader",
    text: props.listName,
    onClick: () => {
      props.onFilterRemove(props.filter.map((filter) => filter.fieldName));
    },
    data: "root"
  });
  for (let i = 0; i < props.filter.length; i++) {
    const iteratedFilter = props.filter[i];

    items.push({
      text: iteratedFilter.fieldName + ": " + iteratedFilter.values.join(","),
      key: "breadcrumbFilter_" + iteratedFilter.fieldName,
      onClick: () => {
        props.onFilterRemove([props.filter[i].fieldName]);
      }
    });
  }

  if (items.length <= 1) {
    return <></>;
  }
  return (
    <Breadcrumb
      items={items}
      onRenderItem={(breadCrumbProps) => {
        return (
          <>
            <CommandBarButton
              iconProps={
                props.filter.length > 0
                  ? {
                      iconName: "ClearFilter"
                    }
                  : undefined
              }
              text={breadCrumbProps?.text}
              // Set split=true to render a SplitButton instead of a regular button with a menu
              // split={true}
              onClick={breadCrumbProps?.onClick as any}
            />
          </>
        );
      }}></Breadcrumb>
  );
};
