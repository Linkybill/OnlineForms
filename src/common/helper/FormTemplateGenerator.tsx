import { Guid } from "@microsoft/sp-core-library";
import { TriggerTypes } from "../actions/models/ActionTriggerTypes";
import { SaveFormTriggerConfig } from "../actions/models/saveFormTrigger/SaveFormTriggerConfig";
import { SetFieldValueTriggerConfig } from "../actions/models/setFieldValue/SetFieldValueTriggerConfig";
import { componentNames } from "../components/componentProxy/models/componentNames";
import { EditorModel } from "../components/editor/models/EditorModel";
import { IComponentGridProps } from "../components/grid/models/componentGridProps";
import { ComponentGridRow } from "../components/grid/models/componentGridRow";
import { FieldDescriptionTypes } from "../listItem/types/FieldDescriptionTypes";
import { FieldTypeNames } from "../listItem/FieldTypeNames";
import { BooleanFieldDescription } from "../listItem/fields/booleanField/BooleanFieldDescription";
import { BUttonFieldDescription } from "../listItem/fields/buttonField/ButtonFieldDescription";

export const createFormTemplateBasedOnFields = (itemProperties: FieldDescriptionTypes[], hiddenWhenConditionForButtons?: string): EditorModel => {
  const saveButtonName = "saveButton";

  const cancelButtonName = "cancelButton";
  const formIsValidFieldName = "formIsValid";

  const saveButtonField: BUttonFieldDescription = {
    defaultValue: {
      isDisabled: false,
      isVisible: true,
      label: "Ok",
      value: ""
    },
    description: "",
    displayName: "Ok",
    internalName: saveButtonName,
    required: false,
    type: FieldTypeNames.Button,
    uniqueKey: saveButtonName,
    isPrimaryButton: true
  };

  const cancelButtonField: BUttonFieldDescription = {
    defaultValue: {
      isDisabled: false,
      isVisible: true,
      label: "Abbrechen",
      value: ""
    },
    description: "",
    displayName: "Abbrechen",
    internalName: cancelButtonName,
    required: false,
    type: FieldTypeNames.Button,
    uniqueKey: cancelButtonName,
    isPrimaryButton: false
  };

  const formIsValidField: BooleanFieldDescription = {
    defaultValue: false,
    description: "",
    displayName: "Speichern",
    internalName: formIsValidFieldName,
    required: false,
    type: FieldTypeNames.Boolean,
    uniqueKey: formIsValidFieldName
  };
  const componentGridProps: IComponentGridProps = {
    uniqueKey: "defaultGrid",
    gridConfig: {
      rows: itemProperties.map((p): ComponentGridRow => {
        return {
          cells: [
            {
              widths: { smWidth: 12 },
              componentConfig: {
                name: componentNames.fieldPlaceholder,
                props: p
              },
              uniqueIdentifier: p.internalName
            }
          ]
        };
      })
    }
  };
  const gridDummyProps: IComponentGridProps = {
    gridConfig: {
      rows: []
    },
    uniqueKey: "dummy"
  };
  componentGridProps.gridConfig.rows.push({
    cells: [
      {
        uniqueIdentifier: "dummy",
        componentConfig: {
          name: componentNames.componentGrid,

          props: gridDummyProps
        },
        widths: {
          smWidth: 4
        }
      },

      {
        uniqueIdentifier: cancelButtonName,

        componentConfig: {
          name: componentNames.fieldPlaceholder,
          props: cancelButtonField
        },
        widths: {
          smWidth: 4
        }
      },
      {
        uniqueIdentifier: saveButtonName,
        componentConfig: {
          name: componentNames.fieldPlaceholder,
          props: saveButtonField
        },
        widths: {
          smWidth: 4
        }
      }
    ]
  });

  const saveActionTrigger: SaveFormTriggerConfig = {
    fileNameExpression: JSON.stringify({ log: "noNameNeeded" }),
    expressionForVersionComments: "",
    shouldCreateVersion: false,
    shouldRedirectAfterSave: false
  };
  const validateActionTrigger: SetFieldValueTriggerConfig = {
    pathToPropertyInListItemToSet: "/listItem/" + formIsValidFieldName,
    expression: JSON.stringify({ validateForm: [] })
  };

  const closeFormActionTrigger: SetFieldValueTriggerConfig = {
    pathToPropertyInListItemToSet: "/listItem/",
    expression: JSON.stringify({ closeForm: [] })
  };

  const propsToUse = [...itemProperties, saveButtonField, cancelButtonField, formIsValidField];

  const alwaysHiddenWhenConditions: { [key: string]: string } = {};
  if (hiddenWhenConditionForButtons !== undefined) {
    alwaysHiddenWhenConditions["dummy"] = hiddenWhenConditionForButtons;
    alwaysHiddenWhenConditions[cancelButtonName] = hiddenWhenConditionForButtons;
    alwaysHiddenWhenConditions[saveButtonName] = hiddenWhenConditionForButtons;
  }
  const editorModel: EditorModel = {
    componentConfig: {
      name: componentNames.componentGrid,
      props: componentGridProps
    },
    containerFieldsAreLockedConditions: {},
    containerHiddenWhenConditions: alwaysHiddenWhenConditions,
    customFieldDefinitions: propsToUse,
    datasources: [],
    fieldTriggers: [
      {
        config: validateActionTrigger,
        description: "Validierung",
        executionOrder: 0,
        fieldNameWhichTriggersAction: saveButtonName,
        title: "Validierung",
        triggerCondition: "",
        type: TriggerTypes.SetFieldValueTriggerType,
        uniqueIdentifier: Guid.newGuid().toString()
      },
      {
        config: saveActionTrigger,
        description: "Speichert das item",
        executionOrder: 1,
        fieldNameWhichTriggersAction: saveButtonName,
        title: "Speichern",
        triggerCondition: JSON.stringify({ "==": [true, { var: ["listItem." + formIsValidFieldName] }] }),
        type: TriggerTypes.SaveFormTriggerType,
        uniqueIdentifier: Guid.newGuid().toString()
      },
      {
        config: closeFormActionTrigger,
        description: "Schließen",
        executionOrder: 2,
        fieldNameWhichTriggersAction: cancelButtonName,
        title: "Schließen",
        triggerCondition: "",
        type: TriggerTypes.SetFieldValueTriggerType,
        uniqueIdentifier: Guid.newGuid().toString()
      }
    ],
    saveTriggers: [],
    startupTriggers: [],
    uniqueComponentKeys: []
  };
  return editorModel;
};
