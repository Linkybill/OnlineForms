/**
 * Get WebPart (applicationName) and version data and register version information of a webPart by creating a property
 * on global window object.
 *
 * @param {string} companyName
 * @param {string} applicationName
 * @param {string} instanceId
 * @param {string} version
 */
export const registerVersion = (companyName: string, applicationName: string, instanceId: string, version: string): void => {
  (window as any)[companyName] = (window as any)[companyName] || {};
  (window as any)[companyName].appInfos = (window as any)[companyName].appInfos || {};

  (window as any)[companyName].appInfos[applicationName + "_" + instanceId] = "Version" + version;
};
