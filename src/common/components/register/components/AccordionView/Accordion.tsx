import * as React from "react";
import { useState } from "react";
import { IIconProps, CommandButton, IconButton, Link, TextField } from "@fluentui/react";
import { IRegisterProps, RegisterConfig } from "../../types";
import { useEditorContext } from "../../../../helper/EditorContext";
import { ComponentProxy } from "../../../componentProxy/ComponentProxy";
import { ComponentConfig } from "../../../componentProxy/models/componentConfig";
import { componentNames } from "../../../componentProxy/models/componentNames";
import { Guid } from "@microsoft/sp-core-library";

/**
 * This component renders the accordion register list
 *
 * @param param0 Properties of this component
 * @returns The rendered accordion register list
 */
export function Accordion(props: IRegisterProps) {
  const editorContext = useEditorContext();
  const isInEditMode = editorContext?.isInEditMode === true;
  const onComponentUpdated: (componentConfig: ComponentConfig) => void = props.onComponentUpdated !== undefined ? props.onComponentUpdated : () => {};

  /**
   * Array of all register items to be rendered
   */
  const items = props.registerConfigs;

  /**
   * State of opened register
   */
  const [openedRegister, setOpenedRegister] = useState<Array<number>>([]);

  /**
   * Collapsed icon properties used in accordion item expanded state
   */
  const collapsedIcon: IIconProps = {
    iconName: "ChevronRight",
    className: "accordionChevron"
  };

  /**
   * Expanded icon properties used in accordion item expanded state
   */
  const expandedIcon: IIconProps = {
    iconName: "ChevronDown",
    className: "accordionChevron"
  };

  /**
   * Handle "open tab" click
   *
   * @param index
   */
  const openRegister = (index: number): void => {
    setOpenedRegister([...openedRegister, index]);
  };

  /**
   * Handle "close tab" click
   *
   * @param {number} index
   */
  const closeRegister = (index: number): void => {
    let manipulatedOpenedRegister = openedRegister.filter((register) => register !== index);
    setOpenedRegister(manipulatedOpenedRegister);
  };

  /**
   * Open all registers
   */
  const openAllRegisters = (): void => {
    let allRegisters = Array<number>();

    for (let i = 0; i < items.length; i++) {
      allRegisters.push(i);
    }

    setOpenedRegister(allRegisters);
  };

  /**
   * Close all registers
   */
  const closeAllRegisters = (): void => {
    setOpenedRegister([]);
  };

  /**
   * Check if register is currently opened
   *
   * @param index - Register index to check open state
   * @return True, if register represented by given index is opened, false otherwise
   */
  const isRegisterOpened = (index: number): boolean => {
    return openedRegister.indexOf(index, 0) > -1;
  };

  /**
   * Check if all registers of Register WebPart are opened
   *
   * @returns True, if all registers are opened, false otherwise
   */
  const isAllOpened: () => boolean = (): boolean => {
    return items.length === openedRegister.length;
  };

  /**
   * Check if all registers of Register WebPart are closed
   *
   * @returns True, if all registers are closed, false otherwise
   */
  const isAllClosed: () => boolean = (): boolean => {
    return openedRegister.length === 0;
  };

  /**
   * Render a single register item of accordion view
   *
   * @param item - The register to be rendered
   * @param itemIndex - The index of this register in list
   * @returns An ReactNode instance of the rendered register as accordion item, if item exists, null otherwise
   */
  const renderItem = (item: RegisterConfig, itemIndex: number): React.ReactNode | null => {
    const castedIndex: number = itemIndex as number;
    const itemToRender = isRegisterOpened(itemIndex ? itemIndex : 0) ? (
      <ComponentProxy
        key={item.componentConfig.props.uniqueKey}
        componentConfig={item.componentConfig}
        onComponentUpdated={(componentConfig: ComponentConfig) => {
          const currentConfig = props;
          currentConfig.registerConfigs[itemIndex].componentConfig = componentConfig;
          onComponentUpdated({
            name: componentNames.register,
            props: currentConfig
          });
        }}></ComponentProxy>
    ) : (
      <></>
    );

    return item ? (
      <>
        <div key={"item_" + castedIndex}>
          <CommandButton
            key={"openClose_" + props.uniqueKey}
            toggle
            checked={isRegisterOpened(castedIndex)}
            text={item.title}
            iconProps={isRegisterOpened(castedIndex) ? expandedIcon : collapsedIcon}
            onClick={() => (isRegisterOpened(castedIndex) ? closeRegister(castedIndex) : openRegister(castedIndex))}
            aria-expanded={isRegisterOpened(castedIndex)}
            onRenderText={(buttonProps, Origin): JSX.Element | null => {
              if (isInEditMode === true) {
                return (
                  <div
                    style={{
                      position: "relative",
                      marginTop: "15px",
                      height: "30px"
                    }}>
                    <span>
                      <TextField
                        onRenderSuffix={(): JSX.Element => {
                          return <></>;
                        }}
                        value={item.title}
                        onChange={(ev, newValue) => {
                          const newProps = props;
                          newProps.registerConfigs[itemIndex].title = newValue as string;
                          onComponentUpdated({
                            name: componentNames.register,
                            props: newProps
                          });
                        }}></TextField>
                    </span>
                  </div>
                );
              } else {
                if (Origin !== undefined) {
                  return <Origin {...buttonProps}></Origin>;
                }
              }
              return <></>;
            }}
          />
          {item.link && <IconButton href={item.link} iconProps={{ iconName: "Link12" }} />}
          {isInEditMode === true && (
            <>
              <>
                <IconButton
                  iconProps={{ iconName: "Delete" }}
                  onClick={() => {
                    editorContext?.removeUniqueComponentKeysWhichArePartOfConig(props.registerConfigs[itemIndex].componentConfig);
                    const newRegisterProps: IRegisterProps = {
                      ...props,
                      registerConfigs: props.registerConfigs.filter((pivot, index) => index !== itemIndex)
                    };
                    const newConfig: ComponentConfig = {
                      name: componentNames.register,
                      props: newRegisterProps
                    };

                    onComponentUpdated(newConfig);
                  }}></IconButton>
                {castedIndex === props.registerConfigs.length - 1 && (
                  <>
                    <div>
                      <IconButton
                        iconProps={{ iconName: "Add" }}
                        onClick={() => {
                          const newProps = props;
                          newProps.registerConfigs.push({
                            title: "newTab",
                            isVisible: true,
                            componentConfig: {
                              name: componentNames.componentGrid,
                              props: {
                                uniqueKey: Guid.newGuid().toString(),
                                gridConfig: {
                                  rows: []
                                }
                              }
                            }
                          });
                          onComponentUpdated({
                            name: componentNames.register,
                            props: newProps
                          });
                        }}
                      />
                    </div>
                  </>
                )}
              </>
            </>
          )}
        </div>

        {/*Preload und hide mit css display:none property*/}
        <div style={isRegisterOpened(itemIndex ? itemIndex : 0) ? { padding: "25px 0 25px 0" } : { padding: "25px 0 25px 0", display: "none" }} id={"register_content_" + itemIndex} key={"register_content_" + itemIndex}>
          {itemToRender}
        </div>
      </>
    ) : null;
  };

  return (
    <>
      <Link onClick={openAllRegisters} disabled={isAllOpened()}>
        Alles öffnen
      </Link>
      <Link onClick={closeAllRegisters} disabled={isAllClosed()} style={{ marginLeft: 5 }}>
        Alles schließen
      </Link>
      {items && items.length > 0 ? (
        items.map((item, index) => {
          return <span key={"span_" + index}>{renderItem(item, index)}</span>;
        })
      ) : (
        <p>Register is not defined</p>
      )}
    </>
  );
}
