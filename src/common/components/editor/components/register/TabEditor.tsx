import { IconButton, IPivotItemProps, IRenderFunction, Pivot, PivotItem, TextField } from "@fluentui/react";
import log from "loglevel";
import { useEditorContext } from "../../../../helper/EditorContext";
import { IRegisterProps } from "../../../register/types";
import * as React from "react";
import { ComponentProxy } from "../../../componentProxy/ComponentProxy";
import { ComponentConfig } from "../../../componentProxy/models/componentConfig";
import { componentNames } from "../../../componentProxy/models/componentNames";

export const TabEditor = (props: IRegisterProps) => {
  const editorContext = useEditorContext();
  const renderFnction: IRenderFunction<IPivotItemProps> = (pivotItemProps, originalRender): JSX.Element => {
    return (
      <>
        <TextField
          value={props.registerConfigs[pivotItemProps?.tabIndex as number].title}
          onChange={(ev, newValue) => {
            const newProps: IRegisterProps = {
              ...props
            };
            newProps.registerConfigs[pivotItemProps?.tabIndex as number].title = newValue as string;
            log.debug("tabEditor, changed title, calling onComponentUpdated with", newProps);

            props.onComponentUpdated({
              name: componentNames.register,
              props: newProps
            });
          }}></TextField>
      </>
    );
  };
  const pivotItems = props.registerConfigs.map((register, index) => {
    return (
      <PivotItem onRenderItemLink={renderFnction} tabIndex={index} key={props.registerConfigs[index].componentConfig.props.uniqueKey}>
        <>
          <IconButton
            iconProps={{ iconName: "Delete" }}
            onClick={() => {
              editorContext?.removeUniqueComponentKeysWhichArePartOfConig(props.registerConfigs[index as number].componentConfig);
              const newRegisterProps: IRegisterProps = { ...props, registerConfigs: props.registerConfigs.filter((pivot, pindex) => pindex !== (index as number)) };
              const newConfig: ComponentConfig = {
                name: componentNames.register,
                props: newRegisterProps
              };

              props.onComponentUpdated(newConfig);
            }}></IconButton>
          {index === props.registerConfigs.length - 1 && (
            <IconButton
              iconProps={{ iconName: "Add" }}
              onClick={() => {
                const newRegisterProps: IRegisterProps = {
                  ...props,
                  registerConfigs: [
                    ...props.registerConfigs,
                    {
                      title: "tab " + (props.registerConfigs.length + 1),
                      isVisible: true,
                      componentConfig: {
                        name: componentNames.componentGrid,
                        props: {
                          uniqueKey: "",
                          gridConfig: {
                            rows: []
                          }
                        }
                      }
                    }
                  ]
                };

                const newConfig: ComponentConfig = {
                  name: componentNames.register,
                  props: newRegisterProps
                };
                props.onComponentUpdated(newConfig);
                log.debug("tabEditor: setting new registerConfigs", newRegisterProps.registerConfigs);
              }}></IconButton>
          )}
        </>

        <ComponentProxy
          componentConfig={register.componentConfig}
          onComponentUpdated={(newComponent) => {
            const newConfig = props;
            newConfig.registerConfigs[index].componentConfig = newComponent;
            const updatedComponent: ComponentConfig = {
              name: componentNames.register,
              props: newConfig
            };
            props.onComponentUpdated(updatedComponent);
          }}></ComponentProxy>
      </PivotItem>
    );
  });

  return (
    <>
      <Pivot overflowBehavior="menu">{pivotItems}</Pivot>
    </>
  );
};
