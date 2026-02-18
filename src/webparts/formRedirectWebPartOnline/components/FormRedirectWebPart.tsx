import * as React from "react";
import { IFormRedirectWebPartProps } from "./IFormRedirectWebPartProps";
import { sp } from "@pnp/sp";
import { configureApp } from "../../../common/configuration";
import styles from "../components/FormRedirectWebPart.module.scss";
import { ActiveListFieldNames } from "../../../extensions/formTemplateListActionsOnline/Constants";
export const FormRedirectWebPart = (props: IFormRedirectWebPartProps) => {
  const formIdentifierParameterName = "formId";
  const formWebUrlParameterName = "formWebUrl";
  React.useEffect(() => {
    const initialize = async () => {
      await configureApp(
        "nova",
        "forms",
        "1.0.0- updated", // todo: inject build version or something from pipeline?
        "",
        1,
        props.context,
        {
          cellClassName: styles.column,
          gridClassName: styles.grid,
          rowClassName: styles.row,
          smallClassNamesOneUntilTwelve: [styles.sm1, styles.sm2, styles.sm3, styles.sm4, styles.sm5, styles.sm6, styles.sm7, styles.sm8, styles.sm9, styles.sm10, styles.sm11, styles.sm12],
          lgClassNamesFromOneUntilTwelve: [styles.lg1, styles.lg2, styles.lg3, styles.lg4, styles.lg5, styles.lg6, styles.lg7, styles.lg8, styles.lg9, styles.lg10, styles.lg11, styles.lg12],
          mdClassNamesFromOneUntilTwelve: [styles.md1, styles.md2, styles.md3, styles.md4, styles.md5, styles.md6, styles.md7, styles.md8, styles.md9, styles.md10, styles.md11, styles.md12],
          xlClassNamesFromOneUntilTwelve: [styles.xl1, styles.xl2, styles.xl3, styles.xl4, styles.xl5, styles.xl6, styles.xl7, styles.xl8, styles.xl9, styles.xl10, styles.xl11, styles.xl12],
          xxlClassNamesFromOneUntilTwelve: [styles.xxl1, styles.xxl2, styles.xxl3, styles.xxl4, styles.xxl5, styles.xxl6, styles.xxl7, styles.xxl8, styles.xxl9, styles.xxl10, styles.xxl11, styles.xxl12],
          xxxlClassNamesFromOneUntilTwelve: [styles.xxxl1, styles.xxxl2, styles.xxxl3, styles.xxxl4, styles.xxxl5, styles.xxxl6, styles.xxxl7, styles.xxxl8, styles.xxxl9, styles.xxxl10, styles.xxxl11, styles.xxxl12]
        }
      );
    };
    const searchForPdfAndRedirectToPdf = async () => {
      const searchParams = new URLSearchParams(document.location.search);
      if (searchParams.has(formIdentifierParameterName)) {
        const idenfitier = searchParams.get(formIdentifierParameterName);
        const searchResult = await sp.search(idenfitier + ".pdf");
        if (searchResult.PrimarySearchResults.length > 0) {
          window.location.href = searchResult.PrimarySearchResults[0].OriginalPath;
        }
      }
    };
    const tryRedirectToFormWeb = async () => {
      const searchParams = new URLSearchParams(document.location.search);
      if (searchParams.has(formWebUrlParameterName) && searchParams.has(formIdentifierParameterName)) {
        const idenfitier = searchParams.get(formIdentifierParameterName);
        const formUrl = searchParams.get(formWebUrlParameterName);
        var host = window.location.protocol + "//" + window.location.host;
        var completeUrl = host + "/" + formUrl + "/sitePages/formInstance.aspx?openInPanel=1&formId=" + idenfitier;
        window.location.href = completeUrl;
      } else {
        if (searchParams.has("ID")) {
          const isModern = document.cookie.includes("splnu=1");
          const id = searchParams.get("ID");
          if (isModern) {
            const listTitle = props.context.pageContext.list?.title;
            if (!listTitle) {
              return;
            }
            const formItem = await sp.web.lists.getByTitle(listTitle).items.getById(Number.parseInt(id)).get();
            const formWebUrl = props.context.pageContext.web.absoluteUrl;
            const formIdentifier = formItem[ActiveListFieldNames.formInstanceIdentifier] ?? formItem.FileLeafRef;
            const url = formWebUrl + "/sitePages/formInstance.aspx?openInPanel=1&formId=" + formIdentifier;
            window.location.href = url;
          }
        }
      }
    };
    const tryRedirect = async () => {
      await initialize();
      await searchForPdfAndRedirectToPdf();
      tryRedirectToFormWeb();
    };
    tryRedirect();
  }, []);
  return <>... Das Formular wird geladen</>;
};
