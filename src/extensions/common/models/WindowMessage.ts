export enum MessageTypes {
  openNewTemplatePanel = 1,
  showTemplateWebUrlDropdownsWithRedirectToEditorInSubWeb = 2,
  closePanel = 3,
  showMessage = 4,
  showArchiveFormPage = 5
}
export interface WindowMessage {
  messageId: MessageTypes;
  templateItemId?: number;
  urlsForRedirectToEditorInSubWeb?: string[];
  baseTemplateItemId?: number;
  listItemId?: number;
}
