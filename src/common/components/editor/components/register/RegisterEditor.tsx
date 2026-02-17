import { Dropdown, IconButton, Panel, PanelType } from "@fluentui/react";
import { IRegisterProps } from "../../../register/types";
import { AccordeonEditor } from "./AccordionEditor";
import { TabEditor } from "./TabEditor";
import { TabsConfigurationEditor } from "./TabsConfigurationEditor";
import * as React from "react";
import { useState } from "react";
import { componentNames } from "../../../componentProxy/models/componentNames";

export const RegisterEditor = (props: IRegisterProps): JSX.Element => {
  const [tabEditorVisible, setTabEditorVisible] = useState(false);

  let editor: JSX.Element = props.view === "tabs" ? <TabEditor {...props} registerConfigs={props.registerConfigs}></TabEditor> : <AccordeonEditor {...props} registerConfigs={props.registerConfigs}></AccordeonEditor>;

  return (
    <>
      <Dropdown
        label="Anzeige als"
        onChange={(event, option) => {
          if (option !== undefined) {
            const newProps = { ...props };
            newProps.view = option.key as "accordion" | "tabs";
            props.onComponentUpdated({
              name: componentNames.register,
              props: newProps
            });
          }
        }}
        options={[
          {
            key: "accordion",
            text: "Akordion",
            selected: props.view === "accordion"
          },
          {
            key: "tabs",
            text: "Tabs",
            selected: props.view === "tabs"
          }
        ]}></Dropdown>
      <IconButton
        iconProps={{ iconName: "Edit" }}
        onClick={() => {
          setTabEditorVisible(true);
        }}></IconButton>

      {editor}
      {tabEditorVisible && (
        <Panel type={PanelType.medium} isOpen={true} onDismiss={() => setTabEditorVisible(false)}>
          <TabsConfigurationEditor
            registerConfigs={props.registerConfigs}
            onRegisterConfigsChanged={(newConfigs) => {
              const newProps = { ...props };
              newProps.registerConfigs = newConfigs;
              props.onComponentUpdated({
                name: componentNames.register,
                props: newProps
              });
            }}></TabsConfigurationEditor>
        </Panel>
      )}
    </>
  );
};
