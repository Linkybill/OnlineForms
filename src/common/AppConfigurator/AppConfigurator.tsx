import { useEffect, useState } from "react";
import { configureApp } from "../configuration";
import { Log } from "@microsoft/sp-core-library";
import styles from "../styles/editorAndFormInstanceStyles.module.scss";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import React from "react";

export const AppConfigurator = (props: { children: JSX.Element | JSX.Element[]; companyName: string; solutionName: string; componentContext: BaseComponentContext }): JSX.Element => {
  const [gotConfigured, setGotConfigured] = useState<boolean>(false);

  useEffect(() => {
    const configureAppInternal = async () => {
      Log.info("configure commandset", "Initialized FormTemplateListActionsCommandSet");
      await configureApp(
        props.companyName,
        props.solutionName,
        "1.0.0....", // todo: inject build version or something from pipeline?
        props.componentContext.instanceId,
        1,
        props.componentContext,
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
      setGotConfigured(true);
    };
    configureAppInternal();
  }, []);

  return <>{gotConfigured && <>{props.children}</>}</>;
};
