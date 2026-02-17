import log from "loglevel";
import { FieldDescriptionTypes } from "../types/FieldDescriptionTypes";
import { FieldValueTypes } from "../types/FieldValueTypes";
import { ListItemField } from "./base/ListItemField";
import * as React from "react";
import { CreateField } from "./CreateField";
import { useListItemContext } from "../../helper/ListItemContext";

export interface IFieldProxyProps {
  propertyInstance: ListItemField<FieldDescriptionTypes, FieldValueTypes>;
  renderAsTextOnly: boolean;
  editMode: boolean;
  onValueChanged: (description: FieldDescriptionTypes, value: FieldValueTypes, validationErrors?: string[]) => void;
}

export const FieldProxy: (props: IFieldProxyProps) => JSX.Element = (props: IFieldProxyProps): JSX.Element => {
  const fieldRef = React.useRef(null);
  const listItemContext = useListItemContext();
  React.useEffect(() => {
    if (listItemContext.isErrorScrolled() == false && props.propertyInstance.validationErrors.length !== 0) {
      fieldRef.current.scrollIntoView();
      listItemContext.setDidScrollToError();
    }
  }, [JSON.stringify(props.propertyInstance.validationErrors), listItemContext.isErrorScrolled(), listItemContext.getErrorScrollCount()]);

  return (
    <div ref={fieldRef} style={{ marginTop: "0.5em", marginBottom: "0.5em" }}>
      <CreateField {...props} />
    </div>
  );
};
