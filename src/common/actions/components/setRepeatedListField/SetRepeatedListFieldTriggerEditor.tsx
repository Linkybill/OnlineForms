import React, { useEffect, useMemo, useState } from "react";
import { ActionButton, MessageBar, MessageBarType } from "@fluentui/react";
import { BooleanField } from "../../../listItem/fields/booleanField/BooleanField";
import { BooleanFieldDescription } from "../../../listItem/fields/booleanField/BooleanFieldDescription";
import { FieldTypeNames } from "../../../listItem/FieldTypeNames";
import { ModalWithCloseButton } from "../../../components/modals/ModalWithCloseButton";
import { ParameterPickerLoadingOptions, ParameterPickerV2 } from "../../../components/editor/components/ParameterPicker/ParameterPickerV2";
import { ParameterInformationContextProvider } from "../../../components/editor/components/conditionEditor/ParameterInformationContext";
import { SharePointCreateListItemsParameterMapper } from "../sharePointCreateListItems/SharePointCreateListItemsParameterMapper";
import { SetRepeatedListFieldTriggerConfig } from "../../models/setRepeatedListField/SetRepeatedListFieldTriggerConfig";
import { useEditorContext } from "../../../helper/EditorContext";
import { mapFieldsToParamter } from "../../../components/editor/components/ParameterPicker/ParameterMapperV2";
import { ParameterV2 } from "../../../components/editor/components/ParameterPicker/ParameterV2";
import { ListFieldDescription } from "../../../listItem/fields/listField/ListFieldDescription";
import { CustomTemplatedListFieldDescription } from "../../../listItem/fields/customTemplatedListField/CustomTemplatedListFieldDescription";
import { FieldDescriptionTypes } from "../../../listItem/types/FieldDescriptionTypes";

const getListFieldNameFromPath = (path: string | undefined): string => {
  if (!path) {
    return "";
  }
  const normalized = path.startsWith("/") ? path : "/" + path;
  const segments = normalized.split("/").filter((s) => s !== "");
  if (segments.length === 0) {
    return "";
  }
  if (segments[0] === "listItem") {
    return segments.length > 1 ? segments[1] : "";
  }
  return segments[0];
};

const buildSchemaParameters = (field: FieldDescriptionTypes | undefined): ParameterV2[] => {
  if (!field) {
    return [];
  }
  if (field.type === FieldTypeNames.List) {
    const listField = field as ListFieldDescription;
    if (!listField.itemProperties || listField.itemProperties.length === 0) {
      return [];
    }
    return mapFieldsToParamter(listField.itemProperties);
  }
  if (field.type === FieldTypeNames.CustomTemplatedEntity) {
    const templatedField = field as CustomTemplatedListFieldDescription;
    if (!templatedField.editorModel || templatedField.editorModel.customFieldDefinitions.length === 0) {
      return [];
    }
    return mapFieldsToParamter(templatedField.editorModel.customFieldDefinitions);
  }
  return [];
};

export const SetRepeatedListFieldTriggerEditor = (props: {
  config: SetRepeatedListFieldTriggerConfig;
  onConfigChanged: (changedConfig: SetRepeatedListFieldTriggerConfig) => void;
}): JSX.Element => {
  const editorContext = useEditorContext();
  const [fieldPickerVisible, setFieldPickerVisible] = useState(false);
  const [arrayPickerVisible, setArrayPickerVisible] = useState(false);
  const [schemaParameters, setSchemaParameters] = useState<ParameterV2[]>([]);
  const [schemaError, setSchemaError] = useState<string | undefined>(undefined);

  const createMultipleFieldDescription: BooleanFieldDescription = useMemo(
    () => ({
      defaultValue: false,
      description: "Mehrere Elemente setzen",
      displayName: "Mehrere Elemente setzen",
      internalName: "CreateMultipleItems",
      required: false,
      type: FieldTypeNames.Boolean,
      uniqueKey: "SetRepeatedListFieldCreateMultiple"
    }),
    []
  );

  useEffect(() => {
    const fieldName = getListFieldNameFromPath(props.config.targetListFieldPath);
    if (!fieldName) {
      setSchemaParameters([]);
      setSchemaError(undefined);
      return;
    }

    const field = editorContext?.editorModel()?.customFieldDefinitions?.find((f) => f.internalName === fieldName);
    if (!field) {
      setSchemaParameters([]);
      setSchemaError("Das ausgewaehlte Feld wurde im Formular nicht gefunden.");
      return;
    }

    const schemaParams = buildSchemaParameters(field);
    if (schemaParams.length === 0) {
      setSchemaParameters([]);
      setSchemaError("Das ausgewaehlte Feld hat kein Schema oder ist kein Wiederholtes Feld.");
      return;
    }

    setSchemaError(undefined);
    setSchemaParameters(schemaParams);
  }, [props.config.targetListFieldPath, editorContext]);

  return (
    <>
      <div style={{ marginBottom: 8 }}>
        <ActionButton
          text="Wiederholtes Feld auswaehlen"
          iconProps={{ iconName: "Add" }}
          onClick={() => {
            setFieldPickerVisible(true);
          }}
        />
        {props.config.targetListFieldPath && <div>{props.config.targetListFieldPath}</div>}
      </div>
      <ModalWithCloseButton
        title="Wiederholtes Feld auswaehlen"
        isOpen={fieldPickerVisible === true}
        onClose={() => {
          setFieldPickerVisible(false);
        }}>
        <div>
          <ParameterInformationContextProvider expectedType="array">
            <ParameterPickerV2
              pathDelimiter="/"
              pathShouldStartWithDelimiter={true}
              selectedPath={props.config.targetListFieldPath ?? ""}
              parameterLoadingOptions={ParameterPickerLoadingOptions.FormFields}
              onParameterPicked={(path) => {
                props.onConfigChanged({ ...props.config, targetListFieldPath: path ?? "" });
                setFieldPickerVisible(false);
              }}
            />
          </ParameterInformationContextProvider>
        </div>
      </ModalWithCloseButton>

      <BooleanField
        validationErrors={[]}
        rawData={""}
        renderAsTextOnly={false}
        onValueChanged={(description, value) => {
          props.onConfigChanged({ ...props.config, createMultipleItems: value === true });
        }}
        editMode={true}
        fieldDescription={createMultipleFieldDescription}
        fieldValue={props.config.createMultipleItems}
        onBlur={(description, value) => {}}
      />
      {props.config.createMultipleItems === true && (
        <>
          <div style={{ marginBottom: 8 }}>
            <ActionButton
              text="Liste/Array auswaehlen"
              iconProps={{ iconName: "Add" }}
              onClick={() => {
                setArrayPickerVisible(true);
              }}
            />
            {props.config.multipleItemsSourcePath !== undefined && props.config.multipleItemsSourcePath !== "" && <div>{props.config.multipleItemsSourcePath}</div>}
          </div>
          <ModalWithCloseButton
            title="Array auswaehlen"
            isOpen={arrayPickerVisible === true}
            onClose={() => {
              setArrayPickerVisible(false);
            }}>
            <div>
              <ParameterInformationContextProvider expectedType="array">
                <ParameterPickerV2
                  pathDelimiter="/"
                  pathShouldStartWithDelimiter={true}
                  selectedPath={props.config.multipleItemsSourcePath ?? ""}
                  parameterLoadingOptions={ParameterPickerLoadingOptions.FormFields | ParameterPickerLoadingOptions.DatasourceResults}
                  onParameterPicked={(path) => {
                    props.onConfigChanged({ ...props.config, multipleItemsSourcePath: path ?? "" });
                    setArrayPickerVisible(false);
                  }}
                />
              </ParameterInformationContextProvider>
            </div>
          </ModalWithCloseButton>
        </>
      )}

      <MessageBar messageBarType={MessageBarType.info}>
        Mapping-Regeln:
        <br />
        - Einzelanlage: Es wird genau ein Element im Wiederholten Feld erzeugt.
        <br />
        - Mehrfachanlage: Der gewaehlte Array-Pfad wird iteriert und pro Element ein Eintrag erzeugt.
        <br />
        - Mapping-Quelle: Pfade unterhalb des Array-Pfads werden relativ zum aktuellen Element gelesen; alle anderen Pfade kommen aus dem gesamten Datenobjekt.
        <br />
        - Mapping-Ziel: Der Ziel-Parameter ist ein Feld aus dem Schema des Wiederholten Feldes.
      </MessageBar>

      <h5>Parametermappings</h5>
      {schemaError && <MessageBar messageBarType={MessageBarType.error}>{schemaError}</MessageBar>}
      {!schemaError && schemaParameters.length === 0 && <div>Bitte ein Wiederholtes Feld auswaehlen, um das Schema zu laden.</div>}
      <SharePointCreateListItemsParameterMapper
        parameterMappings={props.config.parameterMappings}
        listSchemaParameters={schemaParameters}
        onMappingChanged={(newMappings) => {
          props.onConfigChanged({ ...props.config, parameterMappings: newMappings });
        }}
      />
    </>
  );
};
