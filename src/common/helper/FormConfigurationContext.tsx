import * as React from "react";
import { KnownSwaggerDatasource } from "../actions/models/datasources/KnownSwaggerDatasource";
import { sp } from "@pnp/sp";
import { ConfigListService } from "../configListService/ConfigListService";
import log from "loglevel";
import { MessageBar } from "@fluentui/react";
import { CustomThemeProvider } from "../CustomThemeProvider/CustomThemeProvider";
import { useLoadingIndicatorContext } from "./LoadingIndicatorContext";

export interface FormConfiguration {
  swaggerDatasources: KnownSwaggerDatasource[];
}

const FormConfigurationContext = React.createContext<FormConfiguration>({ swaggerDatasources: [] });

export const useFormConfigurationContext = () => React.useContext(FormConfigurationContext);

export const FormConfigurationContextProvider: React.FC<{ children?: string | JSX.Element | JSX.Element[] }> = (props) => {
  const loadSwaggerUrls = async (): Promise<KnownSwaggerDatasource[]> => {
    const webInfoFromRoot = sp.site.rootWeb;
    const config = await ConfigListService.getConfigObject<KnownSwaggerDatasource[]>(webInfoFromRoot, ConfigListService.swaggerDatasourcesConfigName);
    if (config.config === undefined) {
      return [];
    }
    return config.config;
  };

  const [swaggerDatasourceUrls, setSwaggerDatasourceUrls] = React.useState<KnownSwaggerDatasource[]>([]);
  const [error, setError] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const loadingIndicatorContextProvider = useLoadingIndicatorContext();
  React.useEffect(() => {
    const loadAndSetSwaggerDatasourceUrls = async () => {
      loadingIndicatorContextProvider.setLoadingIndication(true, "Lade Datenquellenkonfiguration");
      try {
        const swaggerUrls = await loadSwaggerUrls();
        setSwaggerDatasourceUrls(swaggerUrls);
      } catch (e) {
        log.error("Konfiguration für SwaggerUrls konnte nicht geladen werden. Key für Konfiguration lautet: " + ConfigListService.swaggerDatasourcesConfigName, e);
        setSwaggerDatasourceUrls([]);
        //setError("Die Konfiguration für die SwaggerUrls konnte nicht geladen werden.");
      }

      loadingIndicatorContextProvider.setIsLoading(false);
      setIsLoading(false);
    };

    loadAndSetSwaggerDatasourceUrls();
  }, []);

  return (
    <FormConfigurationContext.Provider value={{ swaggerDatasources: swaggerDatasourceUrls }}>
      <CustomThemeProvider>
        {isLoading === false && (
          <>
            {error === "" && <>{props.children}</>}{" "}
            {error !== "" && (
              <>
                <MessageBar>Konfiguration konnte nicht geladen werden.</MessageBar>
              </>
            )}
          </>
        )}
      </CustomThemeProvider>
    </FormConfigurationContext.Provider>
  );
};
