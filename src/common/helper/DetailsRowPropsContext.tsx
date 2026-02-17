import { IDetailsRowProps } from "@fluentui/react";
import * as React from "react";

const DetailsRowPropsContext = React.createContext<{ props: IDetailsRowProps | undefined }>(undefined);

export const UseDetailsRowPropsContext = () => React.useContext(DetailsRowPropsContext);

export const DetailsRowPropsContextProvider: React.FC<{
  rowProps: IDetailsRowProps;
  isExpanded: boolean;
  children: JSX.Element;
}> = (props) => {
  return <DetailsRowPropsContext.Provider value={{ props: props.rowProps }}>{props.children}</DetailsRowPropsContext.Provider>;
};

export const DetailsRowPropsContextConsumer = (props: { children: (detailsRowProps: IDetailsRowProps | undefined) => JSX.Element }): JSX.Element => {
  return (
    <DetailsRowPropsContext.Consumer>
      {(context) => {
        if (context === undefined) return <></>;
        return props.children(context.props);
      }}
    </DetailsRowPropsContext.Consumer>
  );
};
