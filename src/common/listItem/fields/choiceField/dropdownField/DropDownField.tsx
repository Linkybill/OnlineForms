import { Dropdown, IconButton, IDropdownOption } from "@fluentui/react";
import log from "loglevel";
import { TextKeyChoice } from "../ChoiceFieldDescription";
import { FieldTextRenderer } from "@pnp/spfx-controls-react";
import * as React from "react";
import { WithErrorsBottom } from "../../../../components/errorComponent/WithErrorsBottom";
import { useParameterPickerContext } from "../../../../helper/parameterPickerContext/ParameterPickerContext";
import { useListItemContext } from "../../../../helper/ListItemContext";
import { useComponentContext } from "../../../../helper/CurrentWebPartContext";
import { usePermissionContext } from "../../../../helper/PermissionContext";
import { IDropDownFieldProps } from "./DropDownFieldProps";
import { JsonLogicHelper } from "../../../../helper/JSONLogicHelper";

// Diese Feldimplementierung geht davon aus, dass der Wert, der reinkommt, ein Stringarray ist. Es hat vor der Umstellung mit Wert auf TextKeyValue so existiert und muss wegen alter Formulare so weiterbestehen.
// Es wurde ein DropdownFieldProxy implementiert, welcher schaut, ob der Wert vorhanden ist und ein Stringarray ist, falls ja, wird diese Implementierung verwendet, sonst die neue Implementierung
export const DropDownField = (props: IDropDownFieldProps): JSX.Element => {
  const fieldValue = props.fieldValue !== undefined && props.fieldValue !== null ? (props.fieldValue as string[]) : [];

  const parameterContext = useParameterPickerContext();
  const listItemContext = useListItemContext();
  const componentContext = useComponentContext();
  const permissionContext = usePermissionContext();

  // analog zu deiner Checkbox-Logik: wenn ParameterPicker aktiv ist, nimm dessen Context
  const listItemContextToUseForContent = parameterContext.listItemContextForParameterPicker === undefined ? listItemContext : parameterContext.listItemContextForParameterPicker;

  if (props.renderAsTextOnly) {
    return <FieldTextRenderer text={fieldValue.join(",")} />;
  }

  let options: IDropdownOption[] = props.fieldDescription.choices.map((choice): IDropdownOption => {
    return {
      key: choice,
      text: choice,
      selected: fieldValue.indexOf(choice) !== -1
    };
  });

  if (props.fieldDescription.textKeyChoices !== undefined) {
    options = props.fieldDescription.textKeyChoices.map((choice): IDropdownOption => {
      return {
        key: choice.key,
        text: choice.text,
        selected: fieldValue.indexOf(choice.key) !== -1
      };
    });
  }

  if (props.fieldDescription.formulaForChoices) {
    const li = listItemContextToUseForContent.getListItem();

    const helper = new JsonLogicHelper(componentContext.context, listItemContextToUseForContent, li?.ID ?? 0, permissionContext);

    const optionsArray: TextKeyChoice[] = helper.evaluate<TextKeyChoice[]>(props.fieldDescription.formulaForChoices, li, listItemContextToUseForContent.getDatasourceResults());

    // sauber auf IDropdownOption mappen
    options = (optionsArray ?? []).map((o) => ({
      key: o.key,
      text: o.text,
      data: o.data,
      selected: fieldValue.indexOf(o.key) !== -1
    }));
  }

  let selectedKeys = null;
  let selectedKey = null;

  if (fieldValue.length > 0) {
    selectedKeys = props.fieldDescription.enableMultipleSelections ? fieldValue : undefined;
    selectedKey = props.fieldDescription.enableMultipleSelections ? undefined : fieldValue.length >= 1 ? fieldValue[0] : undefined;
  }

  if (!options) {
    options = [];
  }

  // fehlende Werte ergänzen, damit "alte" gespeicherte Werte nicht verschwinden
  fieldValue.forEach((element) => {
    const exists = options.some((o) => o.key == element);
    if (!exists) {
      const missingOption: IDropdownOption = {
        key: element,
        text: element
      };
      options = [...options, missingOption];
    }
  });

  return (
    <WithErrorsBottom errors={props.validationErrors}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <div style={{ flexGrow: 1 }}>
          <Dropdown
            label={props.fieldDescription.displayName}
            disabled={!props.editMode}
            required={props.fieldDescription.required}
            options={options}
            selectedKeys={selectedKeys}
            selectedKey={selectedKey}
            multiSelect={props.fieldDescription.enableMultipleSelections}
            onChange={(event, item, index) => {
              let currentValues = fieldValue;
              log.debug("triggered change for field " + props.fieldDescription.internalName + " with item ", item);

              if (props.fieldDescription.enableMultipleSelections) {
                // add item
                if (item?.selected === true) {
                  currentValues.push(item.key ? item.key.toString() : "");
                } else if (item?.selected === false || item?.selected === undefined) {
                  // remove item
                  currentValues = currentValues.filter((val) => val !== item?.key);
                }
              } else {
                currentValues = [item?.key ? item.key.toString() : ""];
              }

              log.debug("dropdown " + props.fieldDescription.displayName + " vale changed, going to call onchange with ", currentValues);
              props.onValueChanged(props.fieldDescription, currentValues);
            }}
          />
        </div>
        {props.editMode && fieldValue.length > 0 && (
          <IconButton
            iconProps={{ iconName: "Clear" }}
            title="Auswahl aufheben"
            ariaLabel="Auswahl aufheben"
            onClick={() => {
              props.onValueChanged(props.fieldDescription, []);
            }}
          />
        )}
      </div>
    </WithErrorsBottom>
  );
};
