import * as React from "react";
import { Grid } from "../grid/grid";
import { ErrorText } from "./ErrorText";

export const WithErrorsTop: React.FC<{ children?: JSX.Element | JSX.Element[] | string; errors: string[] | undefined }> = (props): JSX.Element => {
  const hasErrors = props.errors !== undefined && props.errors.length > 0 && props.errors.filter((e) => e !== undefined && e !== null && e !== "").length > 0;
  return (
    <>
      <div className={hasErrors ? "errorDiv" : undefined}>
        <Grid
          gridConfig={{
            rows: [
              {
                cells: [
                  {
                    uniqueKey: "errorCell2",
                    content: (
                      <>
                        {props.errors !== undefined &&
                          props.errors.length > 0 &&
                          props.errors
                            .filter((e) => e !== undefined && e !== null && e !== "")
                            .map((error, index) => {
                              return <ErrorText error={error} />;
                            })}
                      </>
                    ),
                    widths: { smWidth: 12 }
                  },
                  {
                    uniqueKey: "errorCell1",
                    content: <>{props.children}</>,
                    widths: { smWidth: 12 }
                  }
                ]
              }
            ]
          }}
        />
      </div>
    </>
  );
};
