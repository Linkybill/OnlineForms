import { Dropdown, IconButton, IDropdownOption } from "@fluentui/react";
import log from "loglevel";
import { TextKeyChoice } from "../ChoiceFieldDescription";
import { FieldTextRenderer } from "@pnp/spfx-controls-react";
import * as React from "react";
import { WithErrorsBottom } from "../../../../components/errorComponent/WithErrorsBottom";
import { useListItemContext } from "../../../../helper/ListItemContext";
import { useComponentContext } from "../../../../helper/CurrentWebPartContext";
import { usePermissionContext } from "../../../../helper/PermissionContext";
import { IDropDownFieldProps } from "./DropDownFieldProps";
import { JsonLogicHelper } from "../../../../helper/JSONLogicHelper";

// Diese Feldimplementierung geht davon aus, dass der Wert ein TextKeyChoice mit Daten ist. Das ist ein Refactoring der Datenstruktur vom Dropdownfield, welches nur Stringarrays gespeichert hat. Beide Implementierungen müssen noch existieren.
export const DropDownFieldWithTextKeyChoicesInValue = (props: IDropDownFieldProps): JSX.Element => {
  const fieldValue = props.fieldValue !== undefined ? (props.fieldValue as TextKeyChoice[]) : ([] as TextKeyChoice[]);
  const currentSelectedKeys = fieldValue.map((val) => val.key);

  const listItemContext = useListItemContext();
  const componentContext = useComponentContext();
  const permissionContext = usePermissionContext();

  if (props.renderAsTextOnly) {
    return <FieldTextRenderer text={fieldValue.map((choice) => choice.text).join(",")}></FieldTextRenderer>;
  }

  let options: IDropdownOption[] = props.fieldDescription.choices.map((choice): IDropdownOption => {
    return {
      key: choice,
      text: choice,
      selected: currentSelectedKeys.indexOf(choice) !== -1
    };
  });

  if (props.fieldDescription.textKeyChoices !== undefined) {
    options = props.fieldDescription.textKeyChoices.map((choice): IDropdownOption => {
      return {
        key: choice.key,
        text: choice.text,
        selected: currentSelectedKeys.indexOf(choice.key) !== -1
      };
    });
  }

  if (props.fieldDescription.formulaForChoices !== undefined && props.fieldDescription.formulaForChoices !== null && props.fieldDescription.formulaForChoices !== "") {
    // ✅ nur hier: statt JSONLogicInstance + createDataForJsonLogic => Helper nutzen
    const helper = new JsonLogicHelper(componentContext.context, listItemContext, listItemContext.getListItem().ID, permissionContext);

    const optionsArray: TextKeyChoice[] = helper.evaluate<TextKeyChoice[]>(props.fieldDescription.formulaForChoices, listItemContext.getListItem(), listItemContext.getDatasourceResults());

    options = optionsArray;
  }

  let selectedKeys = null;
  let selectedKey = null;

  if (fieldValue.length > 0) {
    selectedKeys = props.fieldDescription.enableMultipleSelections ? currentSelectedKeys : undefined;
    selectedKey = props.fieldDescription.enableMultipleSelections ? undefined : currentSelectedKeys.length >= 1 ? currentSelectedKeys[0] : undefined;
  }

  if (!options) {
    options = [];
  }

  fieldValue.forEach((element) => {
    const exists = options.some((o) => o.key === element.key);
    if (!exists) {
      const missingOption: IDropdownOption = {
        key: element.key,
        text: element.text,
        data: element.data
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
                  currentValues.push({ key: item.key.toString(), text: item.text, data: item.data });
                } else if (item?.selected === false || item?.selected === undefined) {
                  // remove item
                  currentValues = currentValues.filter((val) => val.key !== item?.key);
                }
              } else {
                currentValues = [
                  {
                    key: item.key.toString(),
                    text: item.text,
                    data: item.data
                  }
                ];
              }

              log.debug("dropdown " + props.fieldDescription.displayName + " vale changed, going to call onchange with ", currentValues);
              props.onValueChanged(props.fieldDescription, currentValues);
            }}></Dropdown>
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
