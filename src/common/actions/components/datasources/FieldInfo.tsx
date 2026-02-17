import React from "react";
import { Grid } from "../../../components/grid/grid";
import { FieldDescription } from "../../../listItem/fields/base/FieldDescription";
import { FieldValueTypes } from "../../../listItem/types/FieldValueTypes";

export const FieldInfo = (props: { fieldDescription: FieldDescription<FieldValueTypes> }): JSX.Element => {
  return (
    <>
      <div style={{ marginTop: 8, marginBottom: 8, paddingLeft: 5, width: "100%" }}>
        <Grid
          gridConfig={{
            rows: [
              {
                cells: [
                  {
                    uniqueKey: "info1",
                    content: <>Titel</>,
                    widths: { smWidth: 2 }
                  },
                  {
                    uniqueKey: "info2",
                    content: <>{props.fieldDescription.displayName}</>,
                    widths: { smWidth: 10 }
                  }
                ]
              },
              {
                cells: [
                  {
                    uniqueKey: "internalName",
                    content: <>Interner Name</>,
                    widths: { smWidth: 2 }
                  },
                  {
                    uniqueKey: "internalNameContent",
                    content: <>{props.fieldDescription.internalName}</>,
                    widths: { smWidth: 10 }
                  }
                ]
              },
              {
                cells: [
                  {
                    uniqueKey: "typeCell",
                    content: <>Typ</>,
                    widths: { smWidth: 2 }
                  },
                  {
                    uniqueKey: "TypeContent",
                    content: <>{props.fieldDescription.type}</>,
                    widths: { smWidth: 10 }
                  }
                ]
              }
            ]
          }}></Grid>
      </div>
    </>
  );
};
