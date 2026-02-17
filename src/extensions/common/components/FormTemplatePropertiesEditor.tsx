import React, { useState } from "react";
import { IconButton, TextField, Toggle } from "@fluentui/react";
import { FormTemplate } from "../models/FormTemplate";
import { addNewTemplateAndConfigureExistingWeb, addNewTemplateWithNewWeb } from "../../../common/formTemplates/services/FormTemplateService";
import { WebPicker } from "../../../common/components/picker/components/WebPicker";
import { WithErrorsTop } from "../../../common/components/errorComponent/WithErrorsTop";
import { DateTimeField } from "../../../common/listItem/fields/dateTimeField/DateTimeField";
import { DateTimeDisplayMode } from "../../../common/listItem/fields/dateTimeField/DateTimeFieldDescription";
import { FieldTypeNames } from "../../../common/listItem/FieldTypeNames";
import { Guid } from "@microsoft/sp-core-library";
import log from "loglevel";
import { mapDateTimeValueToDate } from "../../../common/listItem/fields/dateTimeField/DateTimeValueMapper";
import { useLoadingIndicatorContext } from "../../../common/helper/LoadingIndicatorContext";

export const FormTemplatePropertiesEditor = (props: { baseTemplateId: number | undefined; onUpdateSuccessfull: (model: FormTemplate) => void }): JSX.Element => {
  const [template, setTemplate] = useState<FormTemplate>({
    description: "",
    title: "",
    templateIdenfitier: "",
    templateVersionIdentifier: "",
    validFrom: new Date(),
    validUntil: new Date(),
    currentETag: "1"
  });

  const [selectedWebIdsForNewWebCreation, setSelectedWebIdsForNewWebCreation] = useState<string[]>([]);
  const [shouldCreateNewWeb, setShouldCreateNewWeb] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const loadingIndicatorContext = useLoadingIndicatorContext();
  const validateForm = (): boolean => {
    if (isLoading === true) {
      return false;
    }

    if (shouldCreateNewWeb === false) {
      return selectedWebIdsForNewWebCreation.length === 1 && template.title !== "";
    }
    return true;
  };

  const submitForm = async (): Promise<void> => {
    setIsLoading(true);
    loadingIndicatorContext.setLoadingIndication(true, "Vorlage wird gespeichert");
    if (shouldCreateNewWeb === true) {
      const result = await addNewTemplateWithNewWeb(template.title, template.description, template.validFrom, template.validUntil, Guid.newGuid().toString(), Guid.newGuid().toString(), props.baseTemplateId);
      setTemplate(result.model);
      setError(result.error);
      setIsLoading(false);
      loadingIndicatorContext.setIsLoading(false);
      if (result.error === undefined) {
        props.onUpdateSuccessfull(result.model);
      }
    } else {
      const result = await addNewTemplateAndConfigureExistingWeb(
        template.title,
        template.description,
        template.validFrom,
        template.validUntil,
        Guid.newGuid().toString(),
        Guid.newGuid().toString(),
        selectedWebIdsForNewWebCreation[0],
        props.baseTemplateId
      );

      setTemplate(result.model);
      setError(result.error);
      setIsLoading(false);
      loadingIndicatorContext.setIsLoading(false);
      if (result.error === undefined) {
        props.onUpdateSuccessfull(result.model);
      }
    }
  };

  log.debug("rendering properties editor for templates with", { isLoading: isLoading });
  return (
    <>
      <WithErrorsTop errors={error === undefined ? [] : [error]}>
        <TextField
          value={template.title}
          label="Titel"
          onChange={(ev, val) => {
            setTemplate((old) => {
              return { ...old, title: val };
            });
          }}
        />
        <TextField
          multiline={true}
          label="Beschreibung"
          value={template.description}
          onChange={(ev, val) => {
            setTemplate((old) => {
              return { ...old, description: val };
            });
          }}
        />
        <DateTimeField
          onBlur={() => {}}
          fieldValue={{ date: template.validFrom, time: template.validFrom }}
          onValueChanged={(description, val) => {
            setTemplate((old) => {
              return { ...old, validFrom: mapDateTimeValueToDate(val) };
            });
          }}
          editMode={true}
          fieldDescription={{
            defaultValue: undefined,
            description: "Gültiv ab",
            displayMode: DateTimeDisplayMode.DateAndTime,
            displayName: "Gültig ab",
            internalName: "ValidFrom",
            required: true,
            type: FieldTypeNames.DateTime,
            uniqueKey: "valid from"
          }}
          rawData={undefined}
          renderAsTextOnly={false}
          validationErrors={[]}
        />
        <DateTimeField
          onBlur={() => {}}
          fieldValue={{ date: template.validUntil, time: template.validUntil }}
          onValueChanged={(description, val) => {
            setTemplate((old) => {
              return { ...old, validUntil: mapDateTimeValueToDate(val) };
            });
          }}
          editMode={true}
          fieldDescription={{
            defaultValue: undefined,
            description: "Gültig bis",
            displayMode: DateTimeDisplayMode.DateAndTime,
            displayName: "Gültig bis",
            internalName: "ValidUntil",
            required: true,
            type: FieldTypeNames.DateTime,
            uniqueKey: "valid until"
          }}
          rawData={undefined}
          renderAsTextOnly={false}
          validationErrors={[]}
        />

        <>
          <Toggle
            label={"neues Web anlegen?"}
            checked={shouldCreateNewWeb}
            onChange={(ev, val) => {
              setShouldCreateNewWeb(val);
            }}
          />

          {shouldCreateNewWeb === false && (
            <>
              <WebPicker
                allowMultipleSelections={false}
                label="Formular web auswählen"
                selectedWebIds={selectedWebIdsForNewWebCreation}
                editMode={true}
                onSelectionApproved={(ids) => {
                  setSelectedWebIdsForNewWebCreation(ids.map((id) => id.Id.toString()));
                }}></WebPicker>
            </>
          )}
        </>
        <IconButton iconProps={{ iconName: "Save" }} text="Übernehmen" disabled={validateForm() === false} onClick={submitForm} />
      </WithErrorsTop>
    </>
  );
};
