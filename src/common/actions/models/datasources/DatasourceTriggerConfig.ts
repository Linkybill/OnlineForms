import { ParameterMapping } from "./ParameterMapping";

export interface DatasourceTriggerConfig {
  datasourceIdWhichGetsTriggered: string;
  inputParameterMappings: ParameterMapping[];
  parameterName: string;
}
