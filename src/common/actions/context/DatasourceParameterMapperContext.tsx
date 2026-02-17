import * as React from "react";

export interface IDatasourceParameterMapperContextAccessor {
  expandedTargetPaths: string[];
  expandedSourcePaths: string[];
  setExpandedTargetPaths: (paths: string[]) => void;
  setExpandedSourcePaths: (paths: string[]) => void;
}
export const DatasourceParameterMapperContext = React.createContext<IDatasourceParameterMapperContextAccessor>({
  expandedTargetPaths: [],
  expandedSourcePaths: [],
  setExpandedTargetPaths: function (paths: string[]): void {
    throw new Error("Function not implemented.");
  },
  setExpandedSourcePaths: function (paths: string[]): void {
    throw new Error("Function not implemented.");
  }
});

export const useDatasourceParameterMapperContext = () => React.useContext(DatasourceParameterMapperContext);

export const DatasourceParameterMapperContextProvider: React.FC<{ children: JSX.Element }> = (props) => {
  const [expandedSourcePaths, setExpandedSourcePaths] = React.useState<string[]>([]);
  const [expandedTargetPaths, setExpandedTargetPaths] = React.useState<string[]>([]);

  return (
    <DatasourceParameterMapperContext.Provider
      value={{
        expandedSourcePaths: expandedSourcePaths,
        expandedTargetPaths: expandedTargetPaths,
        setExpandedSourcePaths: (paths: string[]) => {
          setExpandedSourcePaths(paths);
        },
        setExpandedTargetPaths: (paths: string[]) => {
          setExpandedTargetPaths(paths);
        }
      }}>
      {props.children}
    </DatasourceParameterMapperContext.Provider>
  );
};

export const DatasourceParameterMapperContextConsumer: React.FC<{
  children: (accessor: IDatasourceParameterMapperContextAccessor) => JSX.Element;
}> = (props): JSX.Element => {
  return <DatasourceParameterMapperContext.Consumer>{(pc) => <>{props.children(pc)}</>}</DatasourceParameterMapperContext.Consumer>;
};
