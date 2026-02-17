import { IWeb, Web } from "@pnp/sp/webs";

export const getIWebObjectForServerRelativeUrl = async (serverRelativeUrl: string): Promise<IWeb> => {
  const absoluteUrl = location.protocol + "//" + location.host + "" + serverRelativeUrl;
  //ar webUrl = await sp.site.getWebUrlFromPageUrl(absoluteUrl);

  const web = Web(absoluteUrl);
  return web;
};
