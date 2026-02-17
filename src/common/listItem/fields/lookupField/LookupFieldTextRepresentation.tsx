import { Link } from "@fluentui/react";
import log from "loglevel";
import { LookupValue } from "../valueTypes/LookupValue";
import { LookupFieldDescription } from "./LookupFieldDescription";
import * as React from "react";
import { ILookupFieldManager } from "../../../components/formcomponents/interfaces/ILookupFieldManager";

export interface ILookupFieldTextRepresentationProps {
  lookupValues: LookupValue[];
  manager: ILookupFieldManager;
  description: LookupFieldDescription;
}
export const LookupFieldTextRepresentation = (props: ILookupFieldTextRepresentationProps): JSX.Element => {
  log.debug("rendering lookup as text only field", props);
  const contentToRender = props.lookupValues.map((lookpValue) => {
    return (
      <>
        <Link
          href={""}
          onClick={() => {
            // this redirect is unstable. It is based on asumption, that the dispform is always siteurl lists + listname + dispform.aspx -> refactor it to do an ajax call or use our custom form
            props.manager.redirectToDisplayForm(props.description.lookupWebId, props.description.lookupListId, lookpValue.lookupId);
          }}
        >
          {lookpValue.value}
        </Link>
        <span> </span>
      </>
    );
  });

  log.debug("lookup as text only: ", contentToRender);
  return <>{contentToRender}</>;
};
