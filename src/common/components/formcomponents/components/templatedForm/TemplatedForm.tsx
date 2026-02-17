import { IconButton, IIconProps } from "@fluentui/react";
import log from "loglevel";
import * as React from "react";
import { ListItem } from "../../../../listItem/ListItem";
import { ComponentProxy } from "../../../componentProxy/ComponentProxy";
import { ComponentConfig } from "../../../componentProxy/models/componentConfig";
import { useListItemContext } from "../../../../helper/ListItemContext";
import { IInjectableComponent } from "../../../injectableComponent/models/InjectableComponent";
import { MergeComponentConfig } from "../../../injectableComponent/helper/ComponentMerger";

export interface ITemplatedFormProps {
  onCloseClicked?: () => void;
  onSubmit?: (valueToSubmit: ListItem) => void;
  editMode: boolean;
  template: ComponentConfig;
  injectableComponents: IInjectableComponent[];
}

const saveButtonProps: IIconProps = {
  iconName: "Save",
  style: { fontSize: 20 }
};
const closeButtonProps: IIconProps = {
  iconName: "ChromeClose",
  style: { fontSize: 15 }
};

export const TemplatedForm = (props: ITemplatedFormProps): JSX.Element => {
  log.debug("rendering templateform with grid", {
    props: props,
    template: props.template
  });

  // todo: Refactoring: Move listItem as Parameter in Props of Form and open ListItemContext here? check if it would work
  const currentItem = useListItemContext();

  const componentConfigToUse = MergeComponentConfig(props.template, "rootComponent", props.injectableComponents, currentItem.getListItem(), (changedItem: ListItem): void => {
    currentItem.replaceListItemAndTriggerConditions(changedItem);
  });

  const showSaveButton = props.onSubmit !== undefined && props.editMode === true;
  return (
    <form style={{ paddingLeft: 15, paddingRight: 15 }}>
      <ComponentProxy componentConfig={componentConfigToUse}></ComponentProxy>
      <div
        style={{
          float: "right",
          marginRight: "4em",
          marginTop: "2em",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
        {showSaveButton === true && (
          <IconButton
            iconProps={saveButtonProps}
            onClick={async () => {
              log.debug("going to submit: ", currentItem);
              const hasErrors = currentItem.applyValidationRules();
              if (hasErrors === false) {
                props.onSubmit(currentItem.getListItem());
              }
            }}></IconButton>
        )}
        {props.onCloseClicked !== undefined && <IconButton style={{ marginLeft: "1em" }} iconProps={closeButtonProps} onClick={props.onCloseClicked}></IconButton>}
      </div>
    </form>
  );
};
