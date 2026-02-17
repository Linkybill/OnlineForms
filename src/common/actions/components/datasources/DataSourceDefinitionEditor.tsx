import React, { useState } from "react";
import { DataSourceDefinition } from "../../models/datasources/DataSourceDefinition";
import { DatasourceTypeNames } from "../../models/datasources/DataSourceTypes";
import { createEmptyDatasourceConfig } from "../../helper/DatasourceHelper";
import { DatasourceConfigEditor } from "./DatasourceConfigEditor";
import { ActionButton } from "@fluentui/react";
import log from "loglevel";

import { DropDownField } from "../../../listItem/fields/choiceField/dropdownField/DropDownField";
import { FieldTypeNames } from "../../../listItem/FieldTypeNames";
import { TextField } from "../../../listItem/fields/textField/TextField";
import { TextKeyChoice } from "../../../listItem/fields/choiceField/ChoiceFieldDescription";
export const DataSourceDefinitionEditor: (props: {
  datasourceDefinition: DataSourceDefinition;
  onCancelClicked: () => void;
  onDataSourceDefintionChanged: (newDataSource: DataSourceDefinition) => void;
}) => JSX.Element = (props): JSX.Element => {
  const [currentDefintion, setCurrentDefintion] = useState(props.datasourceDefinition);
  return (
    <>
      <DropDownField
        onBlur={() => {}}
        rawData={[]}
        validationErrors={[]}
        renderAsTextOnly={false}
        onValueChanged={(description, value) => {
          let valueToUse = "";
          if (typeof value[0] == "string") {
            valueToUse = value[0];
          } else {
            valueToUse = (value[0] as TextKeyChoice).text;
          }

          const newDatasource: DataSourceDefinition = {
            ...currentDefintion,
            typeName: valueToUse as "SwaggerDatasource" | "SharePointDatasource",
            datasourceConfig: createEmptyDatasourceConfig(valueToUse)
          };
          setCurrentDefintion(newDatasource);
        }}
        fieldDescription={{
          formulaForChoices: "",
          choices: [DatasourceTypeNames.SharePointDatasource, DatasourceTypeNames.SwaggerDatasource],
          required: true,
          defaultValue: [DatasourceTypeNames.SharePointDatasource],
          description: "Type auswählen",
          displayName: "Datenquellentyp",
          enableMultipleSelections: false,
          fillInChoiceEnabled: false,
          internalName: "datasourceType",
          uniqueKey: "datasourceType",
          type: ""
        }}
        editMode={true}
        fieldValue={[currentDefintion.typeName]}></DropDownField>
      <TextField
        onBlur={() => {}}
        validationErrors={[]}
        editMode={true}
        rawData={""}
        renderAsTextOnly={false}
        onValueChanged={(field, value) => {
          const newDefinition: DataSourceDefinition = { ...currentDefintion, title: value.toString() };
          setCurrentDefintion(newDefinition);
        }}
        fieldValue={currentDefintion.title}
        fieldDescription={{
          defaultValue: "",
          description: "Bezeichnung",
          displayName: "Bezeichnung",
          internalName: "name",
          required: true,
          type: FieldTypeNames.Text,
          uniqueKey: "datasourceName"
        }}></TextField>
      <>
        <DatasourceConfigEditor
          configTypeName={currentDefintion.typeName}
          datasourceConfig={currentDefintion.datasourceConfig}
          onConfigChanged={(config) => {
            const newDatasource: DataSourceDefinition = {
              ...currentDefintion,
              datasourceConfig: config
            };
            log.debug("datasourceConfigEditor changed config", config, newDatasource);
            setCurrentDefintion({ ...newDatasource });
          }}></DatasourceConfigEditor>
        <ActionButton
          text="Speichern"
          iconProps={{ iconName: "Save" }}
          onClick={() => {
            props.onDataSourceDefintionChanged(currentDefintion);
          }}></ActionButton>
        <ActionButton
          text="Abbrechen"
          iconProps={{ iconName: "Cancel" }}
          onClick={() => {
            props.onCancelClicked();
          }}></ActionButton>
      </>
    </>
  );
};
