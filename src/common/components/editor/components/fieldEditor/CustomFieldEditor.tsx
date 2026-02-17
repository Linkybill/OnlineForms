import log from "loglevel";
import * as React from "react";
import { FieldTypeNames } from "../../../../listItem/FieldTypeNames";
import { ListItem } from "../../../../listItem/ListItem";
import { BooleanFieldDescription } from "../../../../listItem/fields/booleanField/BooleanFieldDescription";
import { ChoiceFieldDescription, TextKeyChoice } from "../../../../listItem/fields/choiceField/ChoiceFieldDescription";
import { ListFieldDescription } from "../../../../listItem/fields/listField/ListFieldDescription";
import { TextFieldDescription } from "../../../../listItem/fields/textField/TextFieldDescription";
import { UrlFieldDescription } from "../../../../listItem/fields/urlField/UrlFieldDescription";
import { UserFieldDescription } from "../../../../listItem/fields/userField/UserFieldDescription";
import { createDefaultItem } from "../../../../listItem/helper/ListHelper";
import { mapListItemToObject } from "../../../../listItem/mapper/ListItemToObjectMapper";
import { mapObjectToListItem } from "../../../../listItem/mapper/ObjectToListItemMapper";
import { FieldDescriptionTypes } from "../../../../listItem/types/FieldDescriptionTypes";
import { SchemaForm } from "../../../formcomponents/components/SchemaForm";
import { CustomFieldListFieldDescription } from "../../../../listItem/fields/customFieldListField/CustomFieldListFieldDescription";
import { NumberFieldDescription } from "../../../../listItem/fields/numberField/NumberFieldDescription";
import { ListItemContextConsumer, ListItemContextProvider } from "../../../../helper/ListItemContext";
import { WebPickerFieldDescription } from "../../../../listItem/fields/webPickerField/WebPickerFieldDescription";
import { ListPickerFieldDescription } from "../../../../listItem/fields/ListPickerField.tsx/ListPickerFieldDescription";
import { NoteFieldDescription } from "../../../../listItem/fields/noteField/NoteFieldDescription";
import { LogicEditorFieldDescription } from "../../../../listItem/fields/LogicEditorField/LogicEditorFieldDescription";
import { EditorContextProvider, useEditorContext } from "../../../../helper/EditorContext";
import { TemplateEditorFieldDescription } from "../../../../listItem/fields/templateEditorField/TemplateEditorFieldDescription";
import { createFormTemplateBasedOnFields } from "../../../../helper/FormTemplateGenerator";
import { ActionTriggerList } from "../../../../actions/components/ActionTriggerList";
import { ActionTrigger } from "../../../../actions/models/ActionTrigger";
import { FieldType } from "../../../../../clients/efav2Client";

export const CustomFieldEditor: React.FC<{
  onFieldChanged: (field: FieldDescriptionTypes, saveTemplate: boolean) => void;
  onTriggerListUpdated: (newTrigger: ActionTrigger[]) => void;
  value: FieldDescriptionTypes;

  onCloseClicked: () => void;
}> = (props): JSX.Element => {
  const editorContext = useEditorContext();
  const isValid = React.useRef<boolean>(true);

  const defaultType: string = FieldTypeNames.Text;

  const formConfigsForFieldType: { [type: string]: FieldDescriptionTypes[] } = {};

  const internalName: TextFieldDescription = {
    description: "Interner Name",
    internalName: "internalName",
    defaultValue: "",
    displayName: "Name",
    required: true,
    type: FieldTypeNames.Text,
    isReadOnly: props.value !== undefined,
    uniqueKey: "internalName"
  };

  const displayName: TextFieldDescription = {
    description: "Anzeigename",
    internalName: "displayName",
    defaultValue: "",
    displayName: "Anzeigename",
    required: true,
    type: FieldTypeNames.Text,
    uniqueKey: "displayName"
  };

  const description: NoteFieldDescription = {
    description: "Beschreibung",
    internalName: "description",
    defaultValue: "",
    displayName: "Beschreibung",
    required: false,
    type: FieldTypeNames.Note,
    uniqueKey: "description",
    fullHtml: true,
    numberOfLines: 30
  };

  const required: BooleanFieldDescription = {
    description: "Pflichtfeld",
    internalName: "required",
    defaultValue: false,
    displayName: "Pflichtfeld, ja oder nein?",
    required: false,
    type: FieldTypeNames.Boolean,
    uniqueKey: "required"
  };

  const requiredWhenConditionField: LogicEditorFieldDescription = {
    description: "ist Pflichtfeld, wenn Bedingung erfüllt ist",
    internalName: "requiredWhenCondition",
    defaultValue: "",
    displayName: "Pflichtfeld, wenn",
    required: false,
    type: FieldTypeNames.LogicEditor,
    uniqueKey: "requiredWhenCondition"
  };

  const expressionForMessageWhileActionsAreRunningField: LogicEditorFieldDescription = {
    description: "Ein Ausdruck, welcher einen Text zurückgibt, der angezeigt wird, während Aktionen, die von diesem Feld aus angestoßen werden, angezeigt wird. Während der Anzeige ist die UI gesperrt.",
    internalName: "expressionForMessageWhileActionsAreRunning",
    defaultValue: "",
    displayName: "Nachricht, die angezeigt wird, während Aktionen ausgeführt werden.",
    required: false,
    type: FieldTypeNames.LogicEditor,
    uniqueKey: "expressionForMessageWhileActionsAreRunning"
  };

  const validationFieldDescriptionField: TextFieldDescription = {
    displayName: "Beschreibung / Name",
    description: "Dient der Übersicht, damit man hier eingeben kann, was diese Validierung bezwecken soll. Nur kurze Beschreibung.",
    defaultValue: "",
    internalName: "description",
    required: false,
    type: FieldTypeNames.Text,
    uniqueKey: "validationFieldDescriptionField"
  };

  const validationRuleConditionWhenToExecuteField = {
    displayName: "Bedingung, wann Regel ausgeführt werden soll",
    description: "Bedingung",
    defaultValue: "",
    internalName: "condition",
    required: false,
    type: FieldTypeNames.LogicEditor,
    uniqueKey: "validationFieldRuleField"
  };

  const validationFieldRuleField: LogicEditorFieldDescription = {
    displayName: "Validierungsregel",
    description: "Regel für die Validierung",
    defaultValue: "",
    internalName: "validationRule",
    required: false,
    type: FieldTypeNames.LogicEditor,
    uniqueKey: "validationFieldRuleField"
  };

  const validationFieldTypeField: ChoiceFieldDescription = {
    formulaForChoices: "",
    displayName: "Validierungstyp",
    description: "falls später weitere Validierungstechniken wie Regex hinzukommen, wird man hier den Typ auswählen können. Aktuell nur jsonLogic",
    defaultValue: ["JSONLogic"],
    choices: ["JSONLogic"],
    enableMultipleSelections: false,
    fillInChoiceEnabled: false,
    internalName: "validationType",
    required: false,
    type: FieldTypeNames.Choice,
    uniqueKey: "validationFieldTypeField"
  };

  const validationFieldErrorMessageField: TextFieldDescription = {
    displayName: "Fehlermeldung",
    description: "Die Fehlermeldung, die angezeigt werden soll, falls diese Condition als false ausgewertet wird.",
    defaultValue: "",
    internalName: "errorMessageOnFail",
    required: false,
    type: FieldTypeNames.Text,
    uniqueKey: "validationFieldErrorMessageField"
  };

  const validationFieldIsActiveField: BooleanFieldDescription = {
    defaultValue: true,
    description: "Angeben, ob die Validierung aktiv ist oder nicht. Wenn nicht, wird sie nicht ausgewertet",
    displayName: "Aktiv?",
    internalName: "isActive",
    required: false,
    type: FieldTypeNames.Boolean,
    uniqueKey: "validationFieldIsActiveField"
  };

  const validationRulesField: ListFieldDescription = {
    internalName: "validationRules",
    description: "Validierungsregeln",
    displayName: "Validierungsregeln",
    defaultValue: [],
    itemProperties: [validationFieldDescriptionField, validationFieldTypeField, validationRuleConditionWhenToExecuteField, validationFieldRuleField, validationFieldErrorMessageField, validationFieldIsActiveField],
    required: false,
    type: FieldTypeNames.List,
    uniqueKey: "validationFieldIsActiveField"
  };

  const conditionFields = [requiredWhenConditionField, validationRulesField, expressionForMessageWhileActionsAreRunningField];

  const choicesForTypeField: TextKeyChoice[] = [
    { key: FieldTypeNames.Text, text: "Textfeld" },
    { key: FieldTypeNames.Note, text: "Mehrzeiliges Textfeld" },
    { key: FieldTypeNames.Boolean, text: "Ja / Nein" },
    { key: FieldTypeNames.Number, text: "Nummer" },
    { key: FieldTypeNames.Currency, text: "Währung" },
    { key: FieldTypeNames.DateTime, text: "Datum" },
    { key: FieldTypeNames.Choice, text: "Auswahl" },
    { key: FieldTypeNames.URL, text: "Url" },
    { key: FieldTypeNames.User, text: "Benutzer" },
    { key: FieldTypeNames.Lookup, text: "Lookup" },
    { key: FieldTypeNames.List, text: "Liste" },
    { key: FieldTypeNames.Button, text: "Schaltfläche" },
    { key: FieldTypeNames.CustomTemplatedEntity, text: "Wiederholter Abschnitt" },
    { key: FieldTypeNames.FileUpload, text: "Dateiupload" },
    { key: FieldTypeNames.JSONData, text: "JSONData" }
  ];

  const typeField: ChoiceFieldDescription = {
    formulaForChoices: "",
    description: "Typ",
    internalName: "type",
    defaultValue: [defaultType],
    displayName: "Typ",
    required: true,
    type: FieldTypeNames.Choice,
    isReadOnly: props.value !== undefined,
    choices: [],
    enableMultipleSelections: false,
    fillInChoiceEnabled: false,
    uniqueKey: "type",
    textKeyChoices: choicesForTypeField
  };

  const displayModeField: TextFieldDescription = {
    defaultValue: "",
    description: "DisplayMode, 0 - Dateonly oder 1 - DateAndTime",
    internalName: "displayMode",
    displayName: "Anzeigemodus",
    type: FieldTypeNames.Number,
    required: true,
    uniqueKey: "displayModeField"
  };

  const choicesField: ListFieldDescription = {
    description: "Auswahloptionen eintragen",
    internalName: "choices",
    defaultValue: [],
    itemProperties: [],
    displayName: "Auswahloptionen",
    required: false,
    type: FieldTypeNames.List,
    newItemLabel: "Neue Auswahl hinzufügen",
    uniqueKey: "choicesField"
  };

  const formulaForChoicesField: LogicEditorFieldDescription = {
    defaultValue: "",
    description:
      "Diese Option wird aktuell nur für die Anzeige als Dropdown unterstützt. Wenn eine Formel eingetragen wird, werden die Optionen auf Basis der Formel ermittelt. Die Einträge in den optionen werden dann ignoriert. Der Rückgabewert muss Array mit folgenden Properties in den Objekten sein: {key: string; data? any (optional), text: string}, wobei text für die Anzeige der Option und der Key für den Wert verwendet wird.",
    displayName: "Optoinen aus Formel beziehen",
    internalName: "formulaForChoices",
    required: false,
    type: FieldTypeNames.LogicEditor,
    uniqueKey: "formulaForChoices"
  };

  const fillInChoiceEnabledField: BooleanFieldDescription = {
    defaultValue: false,
    description: "Angeben, ob Ausfülloption zugelassen wird oder nicht",
    displayName: "Ausfülloption zulassen?",
    internalName: "fillInChoiceEnabled",
    required: false,
    type: FieldTypeNames.Boolean,
    uniqueKey: "fillInChoicesEnabled"
  };

  const enableMultipleSelectionsField: BooleanFieldDescription = {
    defaultValue: true,
    description: "Mehrfachauswahl zulassen, ja oder nein?",
    displayName: "Mehrfachauswahl",
    internalName: "enableMultipleSelections",
    required: false,
    type: FieldTypeNames.Boolean,
    uniqueKey: "enableMultipleSelectionsField"
  };

  const dropDownRepresentationTypeField: ChoiceFieldDescription = {
    formulaForChoices: "",
    displayName: "Darstellung",
    description: "Darstellung: Dropdown oder Radio / Checkbox",
    internalName: "representation",
    defaultValue: [],
    required: false,
    type: FieldTypeNames.Choice,
    choices: ["Dropdown", "Checkbox / Radio"],
    enableMultipleSelections: false,
    fillInChoiceEnabled: false,
    uniqueKey: "representation"
  };
  const fieldValueIsOfTypeTextKeyArrayField: BooleanFieldDescription = {
    defaultValue: true,
    description: "Gibt an, dass der Wertformat dem neuen TextKeyDataModel entspricht. Der Wert darf nicht geändert werden.",
    displayName: "fieldValueIsOfTypeTextKeyArray",
    isReadOnly: false,
    internalName: "fieldValueIsOfTypeTextKeyArray",
    required: false,
    type: FieldTypeNames.Boolean,
    uniqueKey: "isOfTypeTextKeyArray"
  };

  const choicesDefaultValue: ListFieldDescription = {
    description: "Default, Werte, die hier angegeben werden, sind bei neuen Elementen standardmäßig selektiert",
    internalName: "defaultValue",
    defaultValue: [],
    itemProperties: [],
    displayName: "Standardwert",
    required: false,
    type: FieldTypeNames.List,
    newItemLabel: "Neuen Standardwert hinzufügen",
    uniqueKey: "choicesDefaultValue"
  };

  const urlField: UrlFieldDescription = {
    defaultValue: undefined,
    description: "Url eingeben",
    displayName: "Url",
    internalName: "urlField",
    isImageUrl: undefined,
    required: false,
    type: FieldTypeNames.URL,
    uniqueKey: "urlField"
  };

  const isImageUrlField: BooleanFieldDescription = {
    defaultValue: false,
    description: "Angeben, ob es sich um eine Bild-Url handelt oder nicht",
    displayName: "Bild-Url?",
    internalName: "isImageUrlField",
    required: false,
    type: FieldTypeNames.Boolean,
    uniqueKey: "isImageUrlField"
  };

  const userField: UserFieldDescription = {
    defaultValue: [],
    description: "User eingeben",
    displayName: "Nutzer",
    internalName: "userField",
    groupId: undefined,
    allowGroupSelection: false,
    canSelectMultipleItems: false,
    required: false,
    type: FieldTypeNames.User,
    uniqueKey: "userField"
  };

  const groupIdField: TextFieldDescription = {
    defaultValue: "",
    description: "Bitte GruppenID eingeben",
    displayName: "Gruppen Id",
    internalName: "groupIdField",
    required: false,
    type: FieldTypeNames.Number,
    uniqueKey: "groupIdField"
  };

  const allowGroupSelectionField: BooleanFieldDescription = {
    defaultValue: false,
    description: "Gruppenauswahl zulassen, ja oder nein?",
    displayName: "Gruppenauswahl",
    internalName: "groupSelectionField",
    required: false,
    type: FieldTypeNames.Boolean,
    uniqueKey: "allowGroupSelectionField"
  };

  const canSelectMultipleItemsField: BooleanFieldDescription = {
    defaultValue: false,
    description: "Multiauswahl zulassen, ja oder nein?",
    displayName: "Multiauswahl",
    internalName: "canSelectMultipleItems",
    required: false,
    type: FieldTypeNames.Boolean,
    uniqueKey: "canSelectMultipleItemsField"
  };

  const lookupWebIdField: WebPickerFieldDescription = {
    defaultValue: "",
    description: "Bitte Lookup Web Id eingeben",
    displayName: "Lookup Web Id",
    internalName: "lookupWebId",
    required: false,
    type: FieldTypeNames.WebPicker,
    uniqueKey: "lookupWebIdField"
  };

  const lookupListIdField: ListPickerFieldDescription = {
    defaultValue: "",
    description: "Bitte Lookup Listen Id eingeben",
    displayName: "Lookup Listen Id",
    internalName: "lookupListId",
    required: false,
    propertyNameForWebIdFromItemContext: "lookupWebId",
    type: FieldTypeNames.ListPicker,
    uniqueKey: "lookupListIdField"
  };
  const lookupFieldField: TextFieldDescription = {
    defaultValue: "",
    description: "Bitte Lookupfeld eingeben",
    displayName: "Lookupfeld",
    internalName: "lookupField",
    required: false,
    type: FieldTypeNames.Text,
    uniqueKey: "lookupFieldField"
  };

  const customListField: CustomFieldListFieldDescription = {
    defaultValue: [],
    description: "Entität modellieren",
    displayName: "Felder für Liste",
    internalName: "itemProperties",
    required: false,
    type: FieldTypeNames.CustomFieldList,
    uniqueKey: "customListField"
  };
  const editorModelField: TemplateEditorFieldDescription = {
    defaultValue: createFormTemplateBasedOnFields([], JSON.stringify({ queryContains: ["ignoreWorkflowStatus", "1"] })),
    description: "Vorlage für diese Entität",
    displayName: "Vorlage",
    internalName: "editorModel",
    required: false,
    type: FieldTypeNames.FormTemplaeEditor,
    uniqueKey: "templateEditor"
  };
  const fieldNamesToShowInListField: ListFieldDescription = {
    defaultValue: [],
    description: `
    Hier können die Felder eingetragen werden, die in der Liste angezeigt 
      werden sollen. Die Reihenfolge der Felder entspricht die Reihenfolge in der Listenansicht. 
      Zu verwenden sind die internen Namen der Felder aus dem Template.
      Ein Nachschlagen ist derzeit leider nicht implementiert. Gott sei Dank ändern sich interne Namen nicht:-). 
      Wenn nichts angegeben wird, werden alle Felder in der Liste (auch die Buttons) angezeigt.`,
    displayName: "Felder, die in der Liste angezeigt werden sollen.",
    internalName: "fieldNamesToShowInList",
    itemProperties: [],
    required: false,
    uniqueKey: "fieldNamesToShowInList",
    type: FieldTypeNames.List
  };

  const numberOfDecimalsField: ChoiceFieldDescription = {
    formulaForChoices: "",
    displayName: "Anzahl Dezimalstellen",
    description: "Anzahl der Dezimalstellen",
    internalName: "numberOfDecimals",
    defaultValue: [],
    required: false,
    type: FieldTypeNames.Choice,
    choices: ["auto", "0", "1", "2", "3", "4"],
    enableMultipleSelections: false,
    fillInChoiceEnabled: false,
    uniqueKey: "numberOfDecimalsField"
  };
  const labelPrefixField: TextFieldDescription = {
    description: "Prefix für label",
    internalName: "labelPrefix",
    defaultValue: "",
    displayName: "Prefix für Label",
    required: false,
    type: FieldTypeNames.Text,
    isReadOnly: false,
    uniqueKey: "labelPrefix"
  };
  const labelSuffixField: TextFieldDescription = {
    description: "Suffix für label",
    internalName: "labelSuffix",
    defaultValue: "",
    displayName: "Suffix für Label",
    required: false,
    type: FieldTypeNames.Text,
    isReadOnly: false,
    uniqueKey: "labelSuffix"
  };
  const inputPrefixField: TextFieldDescription = {
    description: "Prefix für Eingabefeld",
    internalName: "inputPrefix",
    defaultValue: "",
    displayName: "Prefix für Eingabefeld",
    required: false,
    type: FieldTypeNames.Text,
    isReadOnly: false,
    uniqueKey: "inputPrefix"
  };

  const inputSuffixField: TextFieldDescription = {
    description: "Suffix für Eingabefeld",
    internalName: "inputSuffix",
    defaultValue: "",
    displayName: "Suffix für Eingabefeld",
    required: false,
    type: FieldTypeNames.Text,
    isReadOnly: false,
    uniqueKey: "inputSuffix"
  };

  const numberOfLinesField: NumberFieldDescription = {
    displayName: "Anzahl Zeilen",
    numberOfDecimals: 0,
    description: "Anzahl der Zeilen",
    internalName: "numberOfLines",
    defaultValue: "10",
    required: false,
    type: FieldTypeNames.Note,
    uniqueKey: "numberOfLinesField"
  };

  const fullHtmlField: BooleanFieldDescription = {
    displayName: "Richtext?",
    description: "Richtext?",
    internalName: "fullHtml",
    defaultValue: undefined,
    required: false,
    type: FieldTypeNames.Boolean,
    uniqueKey: "fullHtmlField"
  };

  const itemTemplateField: NoteFieldDescription = {
    defaultValue: "",
    description: "itemTemplate, place properties as {propertyName}",
    displayName: "itemTemplate",
    fullHtml: true,
    internalName: "itemTemplate",
    numberOfLines: 15,
    required: false,
    type: FieldTypeNames.Note,
    uniqueKey: "itemTemplate"
  };

  const outerTemplateField: NoteFieldDescription = {
    defaultValue: "",
    description: "outerTemplate, Placeholder for items must be {0}",
    displayName: "OuterTemplate",
    fullHtml: true,
    internalName: "outerTemplate",
    numberOfLines: 15,
    required: false,
    type: FieldTypeNames.Note,
    uniqueKey: "outerTemplate"
  };

  const newItemLabelField: TextFieldDescription = {
    description: "Beschriftung für Button neues Element hinzufügen",
    internalName: "newItemLabel",
    defaultValue: "",
    displayName: "New Item Label",
    required: false,
    type: FieldTypeNames.Text,
    isReadOnly: false,
    uniqueKey: "newItemLabel"
  };

  const iconNameField: TextFieldDescription = {
    description: "Name des FLuent UI Icons",
    internalName: "iconName",
    defaultValue: "",
    displayName: "Icon Name",
    required: false,
    type: FieldTypeNames.Text,
    isReadOnly: false,
    uniqueKey: "iconName"
  };

  const isIconButtonField: BooleanFieldDescription = {
    displayName: "Als Iconbutton darstellen?",
    description: "Iconbutton?",
    internalName: "isIconButton",
    defaultValue: false,
    required: false,
    type: FieldTypeNames.Boolean,
    uniqueKey: "isIconButton"
  };

  const isPrimaryButtonField: BooleanFieldDescription = {
    defaultValue: false,
    description: "PrimaryButton ja oder nein, Primarybuttons sind anders eingefärbt als nicht Primary BUttons",
    displayName: "PrimaryButton?",
    internalName: "isPrimaryButton",
    required: false,
    type: FieldTypeNames.Boolean,
    uniqueKey: "isImageUrlField"
  };

  const allowMultipleFilesField: BooleanFieldDescription = {
    defaultValue: false,
    description: "Mehrere Dateien hochladen erlauben?",
    displayName: "Mehrere Dateien auswählen?",
    internalName: "allowMultipleFiles",
    required: false,
    type: FieldTypeNames.Boolean,
    uniqueKey: "allowMultipleFiles"
  };
  const currencyLocaleIdField: NumberFieldDescription = {
    defaultValue: 1031,
    description: "1031 für deutsch, ansonsten bitte currency locale ids googlen",
    displayName: "LocaleId",
    internalName: "currencyLocaleId",
    required: false,
    numberOfDecimals: 0,
    type: FieldTypeNames.Number,
    uniqueKey: "currencyLocaleId"
  };

  const defaultFields = [typeField, internalName, displayName, description, required, ...conditionFields];

  formConfigsForFieldType[FieldTypeNames.Button] = [...defaultFields, isPrimaryButtonField, isIconButtonField, iconNameField];
  formConfigsForFieldType[FieldTypeNames.Boolean] = [...defaultFields];
  formConfigsForFieldType[FieldTypeNames.Text] = [...defaultFields];
  formConfigsForFieldType[FieldTypeNames.Note] = [...defaultFields, numberOfLinesField, fullHtmlField];
  formConfigsForFieldType[FieldTypeNames.DateTime] = [...defaultFields, displayModeField];

  formConfigsForFieldType[FieldTypeNames.Choice] = [
    ...defaultFields,
    dropDownRepresentationTypeField,
    fieldValueIsOfTypeTextKeyArrayField,
    choicesField,
    formulaForChoicesField,
    choicesDefaultValue,
    fillInChoiceEnabledField,
    enableMultipleSelectionsField
  ];

  formConfigsForFieldType[FieldTypeNames.URL] = [...defaultFields, urlField, isImageUrlField];
  formConfigsForFieldType[FieldTypeNames.User] = [...defaultFields, userField, groupIdField, allowGroupSelectionField, canSelectMultipleItemsField];
  formConfigsForFieldType[FieldTypeNames.Lookup] = [...defaultFields, lookupWebIdField, lookupListIdField, lookupFieldField, canSelectMultipleItemsField];
  formConfigsForFieldType[FieldTypeNames.List] = [...defaultFields, newItemLabelField, customListField, outerTemplateField, itemTemplateField];
  formConfigsForFieldType[FieldTypeNames.Number] = [...defaultFields, numberOfDecimalsField, labelPrefixField, labelSuffixField, inputPrefixField, inputSuffixField];
  formConfigsForFieldType[FieldTypeNames.Currency] = [...defaultFields, numberOfDecimalsField, currencyLocaleIdField];

  formConfigsForFieldType[FieldTypeNames.CustomTemplatedEntity] = [...defaultFields, editorModelField, fieldNamesToShowInListField];
  formConfigsForFieldType[FieldTypeNames.FileUpload] = [...defaultFields, allowMultipleFilesField];
  formConfigsForFieldType[FieldTypeNames.JSONData] = [...defaultFields];

  const createDefaultValueBasedOnCurrentFormValue = (currentFormValue: FieldDescriptionTypes): FieldDescriptionTypes => {
    const descriptionForDefaultValue: FieldDescriptionTypes = { ...currentFormValue, description: "Wert", displayName: "Wert", internalName: "defaultValue" };
    descriptionForDefaultValue.required = false;
    return descriptionForDefaultValue;
  };

  const createDefaultItemForType = (type: string): ListItem => {
    log.debug("creating defaultItemFor type", type);

    if (props.value !== undefined) {
      const valueToUse = props.value;
      const defaultValueField = createDefaultValueBasedOnCurrentFormValue(valueToUse);

      const schemasForCurrentForm = formConfigsForFieldType[valueToUse.type];
      schemasForCurrentForm.push(defaultValueField);

      const listItem = mapObjectToListItem(schemasForCurrentForm, valueToUse);
      listItem.setValue("type", [listItem.getProperty("type").value]);
      return listItem;
    } else {
      const schemasForCurrentForm = formConfigsForFieldType[type];

      const listItem = createDefaultItem(schemasForCurrentForm, "", []);
      listItem.setValue("type", type); // isNeeded because the schema of type is an array but we want a string
      const formValue: any = mapListItemToObject(listItem);
      const defaultValueDescription = createDefaultValueBasedOnCurrentFormValue(formValue);
      schemasForCurrentForm.push(defaultValueDescription);
      const listItemWithDefaultValue = createDefaultItem([...schemasForCurrentForm], "", []);

      listItemWithDefaultValue.setValue("type", [type]);

      return listItemWithDefaultValue;
    }
  };

  log.debug("rendering customfield editor with props ", props);

  return (
    <>
      <EditorContextProvider
        isInEditMode={false}
        editorModel={{
          componentConfig: undefined,
          containerFieldsAreLockedConditions: {},
          containerHiddenWhenConditions: {},
          customFieldDefinitions: [],
          datasources: [],
          fieldTriggers: [],
          saveTriggers: [],
          startupTriggers: [],
          uniqueComponentKeys: [],
          ignoreFieldsInItemJSON: [],
          mirroredSPListFields: []
        }}>
        <ListItemContextProvider
          onFormClose={() => {}}
          registeredContainerLockedConditions={{}}
          registeredContainerHiddenWhenConditions={{}}
          onListItemSave={(listItem) => listItem}
          listItem={createDefaultItemForType(props.value === undefined ? FieldTypeNames.Text : props.value.type)}>
          <ListItemContextConsumer>
            {(listItemContext) => {
              const submitfield = (item: ListItem, saveTemplate: boolean) => {
                log.debug("CustomFieldEditor: submitting item", item);

                const objectItem = mapListItemToObject(item) as any;
                objectItem.type = item.getProperty("type").value[0];
                log.debug("CustomFieldEditor: submitting item", {
                  listItem: item,
                  mappedObject: objectItem
                });

                const itemHasErrors = item.getProperties().filter((p) => p.validationErrors !== undefined && p.validationErrors.length > 0).length > 0;
                if (itemHasErrors == false) {
                  props.onFieldChanged(objectItem as FieldDescriptionTypes, saveTemplate);
                } else {
                  listItemContext.replaceListItemAndTriggerConditions(item);
                }
              };
              return (
                <>
                  <SchemaForm
                    onCloseClicked={props.onCloseClicked}
                    editMode={true}
                    showSaveButton={true}
                    value={listItemContext.getListItem()}
                    onValueChanged={(field, value) => {
                      log.debug("fieldEditor, fieldChanged", field, value);
                      if (field.internalName === "type") {
                        const item = createDefaultItemForType((value as string[])[0] as string);
                        listItemContext.replaceListItemAndTriggerConditions(item);
                        log.debug("fieldEditor, type changed, new ListItem:", item);
                      } else if (field.internalName === "internalName") {
                        isValid.current = true;
                        const item = listItemContext.getListItem();
                        item.setErrors("internalName", []);
                        const fieldIsUnique = editorContext.editorModel().customFieldDefinitions.filter((field) => field.internalName === value).length === 0;
                        if (!fieldIsUnique) {
                          item.setErrors("internalName", ["Der interne Name muss im Formular eindeutig sein. Der verwendete Name wird bereits verwendet"]);
                          isValid.current = false;
                        }
                        let regex = /^[a-z0-9_-]+$/i;
                        const internalNameHasOnlyLetters = regex.test(value as string);
                        if (internalNameHasOnlyLetters == false) {
                          item.setErrors("internalName", ["Der interne Name darf nur aus alphanumerischen Zeichen bestehen (nur Buchstaben und Zahlen)"]);

                          isValid.current = false;
                        }
                        item.setValue("internalName", (value as string).replace("-", "_x002d_"));
                        listItemContext.replaceListItemAndTriggerConditions(item);
                      } else {
                        log.debug("CustomFieldEditor, onValueChanged, dont need to do something", {
                          field: field,
                          value: value
                        });
                      }
                      if (field.type === FieldTypeNames.FormTemplaeEditor) {
                        const item = listItemContext.getListItem();
                        submitfield(item, true);
                      }
                    }}
                    onSubmit={(item) => {
                      submitfield(item, false);
                    }}></SchemaForm>
                </>
              );
            }}
          </ListItemContextConsumer>
        </ListItemContextProvider>
      </EditorContextProvider>
      {props.value !== undefined && (
        <>
          <div style={{ marginTop: 100 }}>
            <h2>Feldtrigger</h2>
            <ActionTriggerList
              filterListOnFieldName={props.value.internalName}
              actionTrigger={editorContext.editorModel().fieldTriggers}
              onTriggerListChanged={(newTriggerList) => {
                props.onTriggerListUpdated(newTriggerList);
              }}
              parentContainerId=""
              saveImmediatly={true}></ActionTriggerList>
          </div>
        </>
      )}
    </>
  );
};
