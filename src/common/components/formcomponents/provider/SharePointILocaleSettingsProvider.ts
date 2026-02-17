import { sp } from "@pnp/sp";
import { IRegionalSettingsInfo } from "@pnp/sp/regional-settings";
import { ILocaleSettingsProvider } from "../interfaces/ILocaleSettingsProvider";
import log from "loglevel";
export class SharePointLocaleSettingsProvider implements ILocaleSettingsProvider {
  private static currentCultureId: number | undefined = undefined;
  async loadCurrentCultureId(): Promise<number> {
    return await SharePointLocaleSettingsProvider.ensureCurrentCultureId();
  }

  private static async ensureCurrentCultureId(): Promise<number> {
    if (SharePointLocaleSettingsProvider.currentCultureId === undefined) {
      log.debug("going to load culture id from current web");
      const settings: IRegionalSettingsInfo = await sp.web.regionalSettings.get();
      log.debug("loaded culture id", settings);
      SharePointLocaleSettingsProvider.currentCultureId = settings.LocaleId;
    }
    log.debug("culture from current web", SharePointLocaleSettingsProvider.currentCultureId);
    return SharePointLocaleSettingsProvider.currentCultureId;
  }
}
