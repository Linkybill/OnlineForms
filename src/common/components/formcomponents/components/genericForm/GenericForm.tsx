import * as React from "react";
import { IGenericFormProps } from "./IGenericFormProps";
import log from "loglevel";
import { FieldProxy } from "../../../../listItem/fields/FieldProxy";
import { OkAndCancelButton } from "../../../okAndCancelButton/OkAndCancelButton";
import { validateRequiredFieldsOnListItem } from "../../../listView/helper/validations/requiredValidationHelper";

export const GenericForm = (props: IGenericFormProps): JSX.Element => {
  log.debug("rendering generic form", props);

  const propsToShow = props.showIdProperty !== true ? props.value.getProperties().filter((prop) => prop.description.internalName !== "ID") : props.value.getProperties();

  // todo: create logic which creates listItems with react components

  return (
    <form noValidate style={{ paddingLeft: 15, paddingRight: 15 }}>
      {propsToShow.map((prop, index): JSX.Element => {
        return (
          <FieldProxy
            key={"field_" + index}
            editMode={props.editMode}
            renderAsTextOnly={false}
            propertyInstance={prop}
            onValueChanged={props.onValueChanged}
            // todo manage validation errors
          ></FieldProxy>
        );
      })}
      <OkAndCancelButton
        onOkClicked={() => {
          log.debug("going to submit: ", props.value);
          const itemWithRequiredValidations = validateRequiredFieldsOnListItem(props.value, []);
          props.onSubmit(props.value);
        }}
        showOkButton={props.editMode === true && props.showSaveButton === true}
        okButtonText="Speichern"
        okButtonIconName="Save"
        cancelButtonText="Abbrechen"
        onCancelClicked={props.onCloseClicked}
        showCancelButton={props.onCloseClicked !== undefined}
      />
    </form>
  );
};
