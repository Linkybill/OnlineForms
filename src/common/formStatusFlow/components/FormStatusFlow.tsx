import * as React from "react";
import styles from "./FormStatusFlow.module.scss";
import { Graph } from "./Graph";
import { IGraphDataResponseDto } from "../models/GraphResponse";

export const FormStatusFlow = (props: { flowModel: IGraphDataResponseDto }): JSX.Element => {
  return (
    <div className={styles.formStatusFlow}>
      <div className={styles.container}>
        <Graph graphData={props.flowModel.GraphNodes} />
      </div>
    </div>
  );
};
