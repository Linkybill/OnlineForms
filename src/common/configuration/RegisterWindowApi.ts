import log from "loglevel";
export const registerWindowApi = (companyName: string) => {
  (window as any)[companyName] = (window as any)[companyName] || {};
  (window as any)[companyName].setLogLevelToTrace = () => {
    log.setLevel(0);
  };
  (window as any)[companyName].setLogLevelToDebug = () => {
    log.setLevel(1);
  };
  (window as any)[companyName].setLogLevelToInfo = () => {
    log.setLevel(2);
  };
  (window as any)[companyName].setLogLevelToWarn = () => {
    log.setLevel(3);
  };
  (window as any)[companyName].setLogLevelToError = () => {
    log.setLevel(4);
  };
  (window as any)[companyName].setLogLevelToSilent = () => {
    log.setLevel(5);
  };
};
