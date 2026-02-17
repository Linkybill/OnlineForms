export class CommandNames {
  static readonly Command_NewTemplate = "COMMAND_NewTemplate";
  static readonly Command_EditTemplate = "COMMAND_EditTemplate";
  static readonly COMMAND_NewVersionOfTemplate = "COMMAND_NewVersionOfTemplate";
  static readonly COMMAND_NewTemplateBasedOnTemplate = "COMMAND_NewTemplateBasedOnTemplate";
}

export class ListNames {
  static readonly organisationListName = "Organisation";
  static readonly buttonListName = "Schaltflächen";
  static readonly aktiveFormsListName = "Aktiv";
  static readonly formArchiveListName = "Archiv";
  static readonly formTemplateListName = "Formulartemplates";
  static readonly configListName = "Konfiguration";
}
export class FormTemplateFieldNames {
  static readonly templateFieldNameGueltigBis = "ValidUntil";
  static readonly templateFieldNameGueltigVon = "ValidFrom";
  static readonly templateIdentifier = "TemplateIdentifier";
  static readonly templateVersionIdentifier = "VersionIdentifier";
  static readonly templateDescription = "TemplateDescription";
}

export class OrganisationFieldNames {
  static readonly title = "Title";
  static readonly orgUnitTitle = "OrgUnitTitle";
}

export class ActiveListFieldNames {
  static readonly originalFileName = "EFAFormOriginalName";
  static readonly formNextState = "FormNextState";
  static readonly formPreviousState = "FormPrevState";
  static readonly formWebTitle = "EFAFormWebTitle";
  static readonly formActiveSection = "FormActiveSection";
  static readonly formActionFieldName = "FormAction";
  static readonly ebene = "EbeneMitarbeiter";
  static readonly istLeiter = "IstLeiter";
  static readonly extranet = "Extranet";
  static readonly produktion = "Produktion";
  static readonly ankuendigung = "Ankuendigung";
  static readonly ankuendigungAl = "AnkuendigungAL";
  static readonly ukbw = "UKBW";
  static readonly dvua = "DVUA";
  static readonly documentKeyFieldName = "FormDocumentKey";
}

export class ButtonListFieldNames {
  static readonly activeSectionFieldName = "FBActiveSection";
  static readonly buttonPositionFieldName = "FBPosition";
  static readonly buttonActionTitleFieldName = "FBActionTitle";
  static readonly buttonActionFieldName = "FBAction";
  static readonly buttonLabelFieldName = "Title";
}
export class ConfigFieldNames {
  static readonly configNameFieldName = "Name";
  static readonly configValueFieldName = "Value";
}

export enum TemplateEditorRenderType {
  RenderPropertiesEditor = 1,
  RenderTemplateEditor = 2
}

export class UrlParameterNames {
  static readonly templateItemId = "templateItemId";
}
