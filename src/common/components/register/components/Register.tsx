import * as React from "react";
import { Accordion } from "./AccordionView/Accordion";
import { TabsView } from "./TabsView/TabsView";
import { IRegisterProps } from "../types";
import log from "loglevel";

/**
 * Wrapper of register component
 * This component renders either a tab or an accordion depending on view setting.
 */
export class Register extends React.Component<IRegisterProps, {}> {
  public render(): React.ReactElement<IRegisterProps> {
    log.debug("rendering Register with props: ", this.props);
    switch (this.props.view) {
      case "accordion":
        return (
          <Accordion
            {...this.props}
            registerConfigs={this.props.registerConfigs.filter((config): boolean => {
              return config.isVisible !== false;
            })}
          />
        );
      default:
        return (
          <TabsView
            {...this.props}
            registerConfigs={this.props.registerConfigs.filter((config): boolean => {
              return config.isVisible !== false;
            })}
          />
        );
    }
  }
}
