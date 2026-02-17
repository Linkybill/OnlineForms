export interface ILocaleSettingsProvider {
  loadCurrentCultureId(): Promise<number>;
}
