import { Checkbox, DetailsList, IconButton, SelectionMode, TextField } from "@fluentui/react";
import { RegisterConfig } from "../../../register/types";
import * as React from "react";

export const TabsConfigurationEditor: React.FC<{
  registerConfigs: RegisterConfig[];
  onRegisterConfigsChanged: (registerConfigs: RegisterConfig[]) => void;
}> = (props): JSX.Element => {
  return (
    <DetailsList
      selectionMode={SelectionMode.none}
      items={props.registerConfigs}
      columns={[
        {
          minWidth: 100,
          key: "title",
          name: "title",
          fieldName: "title"
        },
        {
          minWidth: 70,
          maxWidth: 70,
          key: "isVisible",
          name: "isVisible",
          fieldName: "isVisible"
        },
        {
          minWidth: 80,
          maxWidth: 100,
          key: "sortOrder",
          name: "sortOrder",
          fieldName: "sortOrder"
        }
      ]}
      onRenderItemColumn={(item, index, column): JSX.Element | null => {
        switch (column?.fieldName) {
          case "title":
            return (
              <TextField
                value={props.registerConfigs[index as number].title}
                onChange={(event, value): void => {
                  const configs = [...props.registerConfigs];
                  configs[index as number].title = value ? value : "";
                  props.onRegisterConfigsChanged(configs);
                }}
              ></TextField>
            );
          case "isVisible":
            return (
              <Checkbox
                checked={props.registerConfigs[index as number].isVisible === true}
                onChange={(event, value): void => {
                  const configs = [...props.registerConfigs];
                  configs[index as number].isVisible = value ? value : false;
                  props.onRegisterConfigsChanged(configs);
                }}
              ></Checkbox>
            );
          case "sortOrder":
            return (
              <>
                {index !== 0 && (
                  <IconButton
                    iconProps={{
                      iconName: "Up"
                    }}
                    onClick={() => {
                      const configs = [...props.registerConfigs];
                      const current = {
                        ...configs[index as number]
                      };
                      configs[index as number] = {
                        ...configs[(index as number) - 1]
                      };
                      configs[(index as number) - 1] = current;
                      props.onRegisterConfigsChanged(configs);
                    }}
                  ></IconButton>
                )}
                {index !== props.registerConfigs.length - 1 && (
                  <IconButton
                    iconProps={{
                      iconName: "Down"
                    }}
                    onClick={() => {
                      const configs = [...props.registerConfigs];
                      const current = {
                        ...configs[index as number]
                      };
                      configs[index as number] = {
                        ...configs[(index as number) + 1]
                      };
                      configs[(index as number) + 1] = current;
                      props.onRegisterConfigsChanged(configs);
                    }}
                  ></IconButton>
                )}
              </>
            );
          default:
            return <>{column?.fieldName} test....</>;
        }
      }}
    ></DetailsList>
  );
};
