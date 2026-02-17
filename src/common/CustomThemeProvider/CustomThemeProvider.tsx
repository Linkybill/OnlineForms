import { useEffect } from "react";
import { createTheme, ITheme, PartialTheme, ThemeProvider } from "@fluentui/react";
import React from "react";

export const CustomThemeProvider = (props: { children: JSX.Element | JSX.Element[] }) => {
  const createThemeInternal = (): PartialTheme => {
    const theme = createTheme(
      {
        palette: {
          themePrimary: "rgb(0, 73, 148)"
        },
        defaultFontStyle: { fontFamily: "Arial", fontSize: 14 }
      },
      false
    );
    var themeToUse = theme;
    return themeToUse;
  };

  const theme: PartialTheme = createThemeInternal();
  return (
    <>
      <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
    </>
  );
};
