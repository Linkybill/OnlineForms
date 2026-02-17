import log, { LogLevelDesc } from "loglevel";
import { apply, LoglevelPluginPrefixOptions, reg } from "loglevel-plugin-prefix";
export const configureLogging: (companyName: string, applicationName: string, level: number) => void = (companyName: string, applicationName: string, level: number): void => {
  var defaults: LoglevelPluginPrefixOptions = {
    template: "%n %t %l:",
    timestampFormatter: function (date: Date) {
      return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    },
    levelFormatter: function (level: string) {
      return level.toUpperCase();
    },
    nameFormatter: function (name: string | undefined) {
      return companyName + "." + applicationName;
    }
  };
  log.setLevel(level as LogLevelDesc);
  reg(log);
  apply(log, defaults);
};
