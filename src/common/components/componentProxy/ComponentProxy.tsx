import { ComponentConfig } from "./models/componentConfig";
import { componentNames } from "./models/componentNames";

import { Html } from "../htmlComponent/htmlComponent";
import { ComponentGrid } from "../grid/componentGrid";
import log from "loglevel";
import { IComponentReactConfig } from "./models/IComponentReactConfig";
import { IHtmlProps } from "../htmlComponent/iHtmlProps";
import { Register } from "../register/components/Register";
import { IRegisterProps } from "../register/types";
import { IComponentGridProps } from "../grid/models/componentGridProps";
import { useEditorContext } from "../../helper/EditorContext";
import { FieldSet } from "../fieldSet/FieldSet";
import { IFieldSetProps } from "../fieldSet/IFieldSetProps";
import * as React from "react";
import { HTMLComponentEditor } from "../editor/components/html/HtmlEditor";
import { RegisterEditor } from "../editor/components/register/RegisterEditor";
import { GridEditor } from "../editor/components/componentGrid/GridEditor";
import { FieldProxy } from "../../listItem/fields/FieldProxy";
import { useListItemContext } from "../../helper/ListItemContext";
import { FieldDescription } from "../../listItem/fields/base/FieldDescription";
import { FieldValueTypes } from "../../listItem/types/FieldValueTypes";
import { FieldDescriptionTypes } from "../../listItem/types/FieldDescriptionTypes";
import { ListItemField } from "../../listItem/fields/base/ListItemField";
import { Guid } from "@microsoft/sp-core-library";
import { ActionButton } from "@fluentui/react";

export const ComponentProxy: React.FC<{
  componentConfig: ComponentConfig;

  onComponentUpdated?: (newComponentConfig: ComponentConfig) => void;
}> = (props): JSX.Element => {
  const editorContext = useEditorContext();
  const isInEditMode = editorContext?.isInEditMode === true;
  const listItemContext = useListItemContext();
  const onComponentUpdated = (newComponentConfig: ComponentConfig): void => {
    const toUpdate: ComponentConfig = {
      ...newComponentConfig,
      props: { ...newComponentConfig.props, uniqueKey: newComponentConfig.props.uniqueKey === undefined || newComponentConfig.props.uniqueKey === "" ? Guid.newGuid().toString() : newComponentConfig.props.uniqueKey }
    };
    if (props.onComponentUpdated !== undefined) {
      props.onComponentUpdated(toUpdate);
    }
  };
  log.debug("componentProxy: ", { isInEditMode: isInEditMode, props: props });
  if (props.componentConfig.props.uniqueKey === "" || props.componentConfig.props.uniqueKey === undefined) {
    props.componentConfig.props.uniqueKey = Guid.newGuid().toString();
  }

  const createComponent = (): JSX.Element => {
    switch (props.componentConfig.name) {
      case componentNames.html:
        log.debug("componentProxy, rendering html component", {
          props: props
        });
        if (isInEditMode) {
          return (
            <>
              <HTMLComponentEditor {...(props.componentConfig.props as IHtmlProps)} onComponentUpdated={onComponentUpdated}></HTMLComponentEditor>
            </>
          );
        }
        return <Html {...(props.componentConfig.props as IHtmlProps)}></Html>;
      case componentNames.reactComponent:
        log.debug("found react component in componentproxy", props);
        return <>{(props.componentConfig.props as IComponentReactConfig).content}</>;
      case componentNames.register:
        log.debug("componentproxy, creating register", {
          props: props
        });
        if (isInEditMode === true) {
          return (
            <>
              <RegisterEditor {...(props.componentConfig.props as IRegisterProps)} onComponentUpdated={onComponentUpdated}></RegisterEditor>
            </>
          );
        }
        return <Register {...(props.componentConfig.props as IRegisterProps)}></Register>;

      case componentNames.componentGrid:
        if (isInEditMode === true) {
          return (
            <>
              <GridEditor {...(props.componentConfig.props as IComponentGridProps)} onComponentUpdated={onComponentUpdated}></GridEditor>
            </>
          );
        }
        return <ComponentGrid {...(props.componentConfig.props as IComponentGridProps)}></ComponentGrid>;
      case componentNames.fieldSet:
        return (
          <>
            <FieldSet {...(props.componentConfig.props as IFieldSetProps)} onComponentUpdated={onComponentUpdated} />
          </>
        );

      case componentNames.fieldPlaceholder: {
        const internalName = (props.componentConfig.props as FieldDescription<FieldValueTypes>).internalName;
        const prop = listItemContext.getProperty(internalName);
        if (prop === undefined) {
          log.warn("feld nicht unterstützt oder wurde entfernt,", props, listItemContext.getListItem().getProperties());
          return <>Field is not supported or got deleted, check log. Field name {internalName} not found</>;
        }
        const propertyInstance: ListItemField<FieldDescriptionTypes, FieldValueTypes> = {
          ...prop,
          description: prop.description,
          validationErrors: prop.validationErrors
        };
        log.debug("ComponentProxy, going to create FieldProxy for field " + prop.description.internalName + " with: ", prop);

        return (
          <>
            {editorContext.isInEditMode == true && (
              <div>
                <ActionButton
                  iconProps={{
                    iconName: "Edit"
                  }}
                  onClick={() => {
                    editorContext.openFieldEditPanel(propertyInstance.description.internalName);
                  }}
                  text={propertyInstance.description.internalName}></ActionButton>
              </div>
            )}
            <FieldProxy propertyInstance={propertyInstance} editMode={true} renderAsTextOnly={false} onValueChanged={() => {}}></FieldProxy>
          </>
        );
      }

      default:
        log.error("component is not supported in componentproxy", props);
        return <>component not supported, check log</>;
    }
  };

  const componentToReturn = createComponent();
  const columnNeesSpacing = props.componentConfig.name !== componentNames.componentGrid;
  return <div className={"componentContainer " + props.componentConfig.name + (columnNeesSpacing === true ? " contentWithSpacing" : "")}>{componentToReturn}</div>;
};
