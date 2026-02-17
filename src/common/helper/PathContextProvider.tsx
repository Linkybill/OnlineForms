import log from "loglevel";
import * as React from "react";

const PathContext = React.createContext<{ path: (string | number)[] }>({ path: [] });

export const UsePathContext = () => React.useContext(PathContext);

export const PathContextProvider: React.FC<{
  children?: string | JSX.Element | JSX.Element[];
  nameInPath: string | number;
}> = (props) => {
  const pathContext = UsePathContext();
  const path = pathContext.path;

  log.debug(log.debug("rendering pathContextProvider with ", props, pathContext.path));
  return <PathContext.Provider value={{ path: [...path, props.nameInPath] }}>{props.children}</PathContext.Provider>;
};

export const PathContextConsumer = (props: { children: (path: Array<string | number>) => JSX.Element }): JSX.Element => {
  return (
    <PathContext.Consumer>
      {(context) => {
        if (context === undefined) return <></>;
        return props.children(context.path);
      }}
    </PathContext.Consumer>
  );
};
