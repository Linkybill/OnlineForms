import React, { useEffect, useMemo, useRef, useState } from "react";
import log from "loglevel";
import { ActionButton, MessageBar, MessageBarType, Spinner } from "@fluentui/react";
import { TextField } from "../../../listItem/fields/textField/TextField";
import { TextFieldDescription } from "../../../listItem/fields/textField/TextFieldDescription";
import { FieldTypeNames } from "../../../listItem/FieldTypeNames";
import { BooleanField } from "../../../listItem/fields/booleanField/BooleanField";
import { BooleanFieldDescription } from "../../../listItem/fields/booleanField/BooleanFieldDescription";
import { SharePointCreateListItemsTriggerConfig } from "../../models/sharePointCreateListItems/SharePointCreateListItemsTriggerConfig";
import { SharePointCreateListItemsParameterMapper } from "./SharePointCreateListItemsParameterMapper";
import { createEfav2Client } from "../../../../clients/efav2ClientCreator";
import { FieldInfoViewModel, ListSchemaViewModel } from "../../../../clients/efav2Client";
import { ParameterV2 } from "../../../components/editor/components/ParameterPicker/ParameterV2";
import { ModalWithCloseButton } from "../../../components/modals/ModalWithCloseButton";
import { ParameterPickerLoadingOptions, ParameterPickerV2 } from "../../../components/editor/components/ParameterPicker/ParameterPickerV2";
import { ParameterInformationContextProvider } from "../../../components/editor/components/conditionEditor/ParameterInformationContext";

const knownFieldTypeNames = new Set<string>(Object.values(FieldTypeNames));

const mapListSchemaFieldsToParameters = (fields?: FieldInfoViewModel[]): ParameterV2[] => {
  if (!fields || fields.length === 0) {
    return [];
  }

  return fields
    .filter((field) => field.readOnlyField !== true && field.typeAsString !== "Computed")
    .map((field) => {
      const typeToUse = field.typeAsString !== undefined && knownFieldTypeNames.has(field.typeAsString) ? (field.typeAsString as FieldTypeNames) : FieldTypeNames.Text;
      return {
        parameterName: field.internalName ?? field.title ?? "",
        displayName: field.title ?? field.internalName ?? "",
        location: "",
        type: typeToUse,
        isExpandable: false,
        pathIsEditableThroughTextField: false
      };
    })
    .filter((node) => node.parameterName !== "")
    .sort((a, b) => a.parameterName.toLowerCase().localeCompare(b.parameterName.toLowerCase()));
};

const normalizeWebUrl = (webUrl: string | undefined): string => {
  if (webUrl === undefined || webUrl === null) {
    return "";
  }
  const trimmed = webUrl.trim();
  if (trimmed === "") {
    return "";
  }
  if (trimmed.startsWith("/")) {
    return window.location.protocol + "//" + window.location.host + trimmed;
  }
  return trimmed;
};

export const SharePointCreateListItemsTriggerEditor = (props: {
  config: SharePointCreateListItemsTriggerConfig;
  onConfigChanged: (changedConfig: SharePointCreateListItemsTriggerConfig) => void;
}): JSX.Element => {
  const [schemaParameters, setSchemaParameters] = useState<ParameterV2[]>([]);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState<string | undefined>(undefined);
  const [arrayPickerVisible, setArrayPickerVisible] = useState(false);
  const requestId = useRef(0);

  const webUrlFieldDescription: TextFieldDescription = useMemo(
    () => ({
      defaultValue: "",
      description: "WebUrl der SharePoint Site",
      displayName: "WebUrl",
      internalName: "WebUrl",
      required: true,
      type: FieldTypeNames.Text,
      uniqueKey: "SharePointCreateItemsWebUrl"
    }),
    []
  );

  const listNameFieldDescription: TextFieldDescription = useMemo(
    () => ({
      defaultValue: "",
      description: "Listenname",
      displayName: "Listenname",
      internalName: "ListName",
      required: true,
      type: FieldTypeNames.Text,
      uniqueKey: "SharePointCreateItemsListName"
    }),
    []
  );

  const createMultipleFieldDescription: BooleanFieldDescription = useMemo(
    () => ({
      defaultValue: false,
      description: "Mehrere Elemente anlegen",
      displayName: "Mehrere Elemente anlegen",
      internalName: "CreateMultipleItems",
      required: false,
      type: FieldTypeNames.Boolean,
      uniqueKey: "SharePointCreateItemsCreateMultiple"
    }),
    []
  );

  useEffect(() => {
    const webUrl = normalizeWebUrl(props.config.webUrl);
    const listName = props.config.listName?.trim();

    if (!webUrl || !listName) {
      setSchemaParameters([]);
      setSchemaError(undefined);
      return;
    }

    let cancelled = false;
    const currentRequestId = ++requestId.current;

    const loadSchema = async () => {
      setSchemaLoading(true);
      setSchemaError(undefined);
      try {
        const client = await createEfav2Client("");
        const schema: ListSchemaViewModel = await client.loadListSchema(webUrl, listName);
        if (cancelled || currentRequestId !== requestId.current) {
          return;
        }
        setSchemaParameters(mapListSchemaFieldsToParameters(schema?.fields));
      } catch (e) {
        if (!cancelled && currentRequestId === requestId.current) {
          log.error("Could not load list schema", e);
          setSchemaParameters([]);
          setSchemaError("Listen-Schema konnte nicht geladen werden.");
        }
      } finally {
        if (!cancelled && currentRequestId === requestId.current) {
          setSchemaLoading(false);
        }
      }
    };

    loadSchema();

    return () => {
      cancelled = true;
    };
  }, [props.config.webUrl, props.config.listName]);

  return (
    <>
      <TextField
        validationErrors={[]}
        rawData={""}
        renderAsTextOnly={false}
        onValueChanged={(description, value) => {
          props.onConfigChanged({ ...props.config, webUrl: value.toString() });
        }}
        editMode={true}
        fieldDescription={webUrlFieldDescription}
        fieldValue={props.config.webUrl}
        onBlur={(description, value) => {}}
      />
      <TextField
        validationErrors={[]}
        rawData={""}
        renderAsTextOnly={false}
        onValueChanged={(description, value) => {
          props.onConfigChanged({ ...props.config, listName: value.toString() });
        }}
        editMode={true}
        fieldDescription={listNameFieldDescription}
        fieldValue={props.config.listName}
        onBlur={(description, value) => {}}
      />
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
              text="Liste/Array auswählen"
              iconProps={{ iconName: "Add" }}
              onClick={() => {
                setArrayPickerVisible(true);
              }}
            />
            {props.config.multipleItemsSourcePath !== undefined && props.config.multipleItemsSourcePath !== "" && <div>{props.config.multipleItemsSourcePath}</div>}
          </div>
          <ModalWithCloseButton
            title="Array auswählen"
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
        - Einzelanlage: Es wird genau ein Item aus den Mappings erzeugt.
        <br />
        - Mehrfachanlage: Der gewaehlte Array-Pfad wird iteriert und pro Element ein Item erzeugt.
        <br />
        - Mapping-Quelle: Pfade unterhalb des Array-Pfads werden relativ zum aktuellen Element gelesen; alle anderen Pfade kommen aus dem gesamten Datenobjekt.
        <br />
        - Listenwerte: Wenn eine Quelle eine Liste ist, wird standardmaessig das erste Element gemappt; ausserhalb gilt die Pfad-Regel oben.
        <br />
        - Mapping-Ziel: Der Ziel-Parameter ist der Listen-Feldname aus dem Schema.
      </MessageBar>

      <h5>Parametermappings</h5>
      {schemaLoading && (
        <div>
          <Spinner label="Lade Listen-Schema..." />
        </div>
      )}
      {schemaError && (
        <MessageBar messageBarType={MessageBarType.error}>
          {schemaError}
        </MessageBar>
      )}
      {!schemaLoading && !schemaError && schemaParameters.length === 0 && <div>Bitte WebUrl und Listenname eingeben, um das Schema zu laden.</div>}
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
