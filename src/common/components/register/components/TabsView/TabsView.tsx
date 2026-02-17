import * as React from "react";
import { Pivot, PivotItem } from "@fluentui/react";
import { IRegisterProps, RegisterConfig } from "../../types";
import { ComponentProxy } from "../../../componentProxy/ComponentProxy";

/**
 * This component renders the tabbed register list
 *
 * @param param0 Properties of this component
 * @returns The rendered tabbed register list
 */
export const TabsView = (props: IRegisterProps): JSX.Element => {
  const items = props.registerConfigs;

  /**
   * Render a single register item of tab view
   *
   * @param item - The register to be rendered
   * @param itemIndex - The index of this register in list
   * @returns An ReactNode instance of the rendered register as tabbed item, if item exists, null otherwise
   */
  const renderItem = (item: RegisterConfig): React.ReactNode => {
    const componentToRender = (
      <div style={{ marginTop: "1em" }}>
        <ComponentProxy componentConfig={item.componentConfig} />
      </div>
    );

    return (
      <PivotItem headerText={item.title} style={item.style} alwaysRender={false} key={item.componentConfig.props.uniqueKey}>
        {componentToRender}
      </PivotItem>
    );
  };

  return (
    <Pivot
      aria-label="Register tabs view"
      overflowBehavior="menu"
      styles={{
        root: {
          marginBottom: "1em"
        },
        itemContainer: {}
      }}>
      {items.length > 0 ? (
        items.map((item) => {
          return renderItem(item);
        })
      ) : (
        <PivotItem headerText="Register leer" style={{ padding: "25px 0 25px 0" }} alwaysRender={true}>
          <p>Register is not defined</p>
        </PivotItem>
      )}
    </Pivot>
  );
};
