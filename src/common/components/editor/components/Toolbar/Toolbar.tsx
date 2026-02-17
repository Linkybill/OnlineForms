import log from "loglevel";
import { useEditorContext } from "../../../../helper/EditorContext";
import { Register } from "../../../register/components/Register";
import { IRegisterProps, RegisterConfig } from "../../../register/types";
import { ComponentDescription } from "../ComponentDescription";
import { DraggableComponent, IDraggableComponentProps } from "../dragDrop/DraggableComponent";
import * as React from "react";
import { componentNames } from "../../../componentProxy/models/componentNames";
import { Guid } from "@microsoft/sp-core-library";

export interface IToolpaneCategory {
  title: string;
  components: IDraggableComponentProps[];
}

export interface IToolpaneProps {
  categories: IToolpaneCategory[];
}
export const Toolbar = (props: IToolpaneProps): JSX.Element => {
  const editorContext = useEditorContext();
  const registerProps: IRegisterProps = {
    view: "tabs",
    uniqueKey: "toolbar",

    registerConfigs: props.categories.map((category, categoryIndex): RegisterConfig => {
      return {
        isVisible: true,
        title: category.title,
        style: {
          height: "120px",
          overflowY: "auto",
          padding: "25px 0 25px 0"
        },
        componentConfig: {
          name: componentNames.reactComponent,
          props: {
            uniqueKey: "toolbarTable_" + categoryIndex,
            content: (
              <>
                {category.components.map((component, componentindex) => {
                  let canBeDragged = true;
                  if (component.canBeUsedOnceOnly === true && editorContext !== undefined) {
                    const componentIsAlreadyInUse = editorContext.currentUniqueKeys.indexOf(component.componentConfig.uniqueComponentIdentifier as string) >= 0;
                    if (componentIsAlreadyInUse) {
                      canBeDragged = false;
                    }
                  }
                  return canBeDragged ? (
                    <DraggableComponent {...component} key={component.componentConfig.props.uniqueKey + "draggableComponent_" + categoryIndex + "_" + componentindex}>
                      <ComponentDescription description={component.description} title={component.title} iconPorps={component.iconProps} canBeDragged={true}></ComponentDescription>
                    </DraggableComponent>
                  ) : (
                    <ComponentDescription description={component.description} title={component.title} iconPorps={component.iconProps} canBeDragged={false}></ComponentDescription>
                  );
                })}
              </>
            )
          }
        }
      };
    })
  };

  log.debug("rendering toolbar", {
    editorContext: editorContext,
    props: props,
    canMoveBackward: editorContext?.historyNavigator.canMoveBackward(),
    canMoveForward: editorContext?.historyNavigator.canMoveForward()
  });
  return (
    <div>
      <Register {...registerProps}></Register>
    </div>
  );
};
