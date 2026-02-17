import React from "react";
import { ParameterMapping } from "../../models/datasources/ParameterMapping";
import { DatasourceParameterMapper } from "./DatasourceParameterMapper";

export const DatasourceInputParameterMapper = (props: { datasourceId: string; parameterMappings: ParameterMapping[]; onMappingChanged: (newMappings: ParameterMapping[]) => void }): JSX.Element => {
  return (
    <>
      <DatasourceParameterMapper
        onMappingChanged={(mappings) => {
          props.onMappingChanged(mappings);
        }}
        datasourceIdForWhichParameterNeesToBeMapped={props.datasourceId}
        expandedSourceNodePaths={[]}
        expandedTargetNodePaths={[]}
        parameterMappings={props.parameterMappings}
        sourceHeadline="Formularparameter"
        targetHeadline="Parameter der Datenquelle"
      />
    </>
  );
};
