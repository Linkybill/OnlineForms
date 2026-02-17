import { initializeIcons } from "@fluentui/react";
import { registerVersion } from "./RegisterVersion";
import { sp } from "@pnp/sp";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { IGridStyleClassNames } from "./models/IGridStyleClassNames";
import { ClassNames } from "./GridClassNames";
import { registerWindowApi } from "./RegisterWindowApi";
import { configureLogging } from "../logging/ConfigureLogging";
import { SPComponentLoader } from "@microsoft/sp-loader";
import "@pnp/sp/presets/all";
import log from "loglevel";
var _context: BaseComponentContext;

export const configureApp = async (
  companyName: string,
  applicationName: string,
  version: string,
  instanceId: string,
  logLevel: number,
  context: BaseComponentContext,
  gridStyleClassNames?: IGridStyleClassNames
): Promise<void> => {
  // this doesnt work. TODO: check how to make icon warning disappear.
  _context = context;
  ensureIconsToBeRegisteredOnce();
  registerVersion(companyName, applicationName, instanceId, version);
  configureLogging(companyName, applicationName, logLevel);
  registerWindowApi(companyName);
  sp.setup({
    spfxContext: {
      pageContext: context.pageContext

      //aadTokenProviderFactory: context.aadTokenProviderFactory,
      //msGraphClientFactory: context.msGraphClientFactory.getClient as any, // todo: check graph integration?
    }
  });

  ClassNames.gridStyleClassNames = gridStyleClassNames !== undefined ? gridStyleClassNames : ClassNames.gridStyleClassNames;

  const loadSP = (): Promise<any> => {
    var globalExportsName = null,
      p = null;
    var promise = new Promise<any>((resolve, reject) => {
      let siteColUrl = context.pageContext.site.absoluteUrl;
      globalExportsName = "$_global_init";
      p = window[globalExportsName] ? Promise.resolve(window[globalExportsName]) : SPComponentLoader.loadScript(siteColUrl + "/_layouts/15/init.js", { globalExportsName });
      p.catch((error) => {
        log.error(error);
      })
        .then(($_global_init): Promise<any> => {
          globalExportsName = "Sys";
          p = window[globalExportsName] ? Promise.resolve(window[globalExportsName]) : SPComponentLoader.loadScript(siteColUrl + "/_layouts/15/MicrosoftAjax.js", { globalExportsName });
          return p;
        })
        .catch((error) => {
          log.error(error);
        })
        .then((Sys): Promise<any> => {
          globalExportsName = "SP";
          p = window[globalExportsName] && SP.ClientRuntimeContext ? Promise.resolve(window[globalExportsName]) : SPComponentLoader.loadScript(siteColUrl + "/_layouts/15/SP.Runtime.js", { globalExportsName });
          return p;
        })
        .catch((error) => {
          log.error(error);
        })
        .then((SP): Promise<any> => {
          globalExportsName = "SP";
          p = window[globalExportsName] && SP.ClientContext ? Promise.resolve(window[globalExportsName]) : SPComponentLoader.loadScript(siteColUrl + "/_layouts/15/SP.js", { globalExportsName });
          return p;
        })
        .catch((error) => {
          log.error(error);
        })
        .then((SP): Promise<any> => {
          globalExportsName = "SP";
          p = window[globalExportsName] && SP.Taxonomy ? Promise.resolve(window[globalExportsName]) : SPComponentLoader.loadScript(siteColUrl + "/_layouts/15/SP.Taxonomy.js", { globalExportsName });
          return p;
        })
        .catch((error) => {
          log.error(error);
        })

        .then((SP): Promise<any> => {
          globalExportsName = "SP.Publishing";
          p = window[globalExportsName] && SP.Publishing ? Promise.resolve(window[globalExportsName]) : SPComponentLoader.loadScript(siteColUrl + "/_layouts/15/SP.Publishing.js", { globalExportsName });
          return p;
        })
        .then((SP): Promise<any> => {
          globalExportsName = "SP.DocumentSet.DocumentSet";
          p = window[globalExportsName] && SP.Publishing ? Promise.resolve(window[globalExportsName]) : SPComponentLoader.loadScript(siteColUrl + "/_layouts/15/sp.documentmanagement.js", { globalExportsName });
          return p;
        })
        .catch((error) => {
          log.error(error);
        })

        // .then((SP) => {
        //   SPComponentLoader.loadCss(siteColUrl + '/Style%20Library/Nova/css/bootstrap-custom.css');
        //   resolve(SP);
        // })
        .then((SP) => {
          resolve(SP);
        });
    });
    return promise;
  };
  await loadSP();
};

/**
 * By default, the Fluent UI icons are not loaded on the page to save downloaded bytes.
 * To make the icons available, they are initialized in this function if not already done.
 * From Fluent UI docu: initializeIcons() should only be called once per app and must be called before rendering any components.
 */
const ensureIconsToBeRegisteredOnce = () => {
  const keyForIconsGotInitialized = "reactIconsInitialized";
  (window as any)[keyForIconsGotInitialized] = (window as any)[keyForIconsGotInitialized] || false;

  if ((window as any)[keyForIconsGotInitialized] === false) {
    initializeIcons();
    (window as any)[keyForIconsGotInitialized] = true;
  }
};

export const getContext = () => _context;
