import * as React from "react";
import { Accordion } from "../../../register/components/AccordionView/Accordion";
import { IRegisterProps } from "../../../register/types";

export const AccordeonEditor: React.FC<IRegisterProps> = (props): JSX.Element => {
  return (
    <>
      <Accordion key={props.uniqueKey} uniqueKey={props.uniqueKey} registerConfigs={props.registerConfigs} onComponentUpdated={props.onComponentUpdated} view={props.view}></Accordion>
    </>
  );
};
