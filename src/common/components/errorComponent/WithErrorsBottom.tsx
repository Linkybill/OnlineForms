import * as React from "react";
import { Grid } from "../grid/grid";
import { MessageBar, MessageBarType } from "@fluentui/react";
import { Guid } from "@microsoft/sp-core-library";
import { ErrorText } from "./ErrorText";

export const WithErrorsBottom: React.FC<{ errors: string[] | undefined; children?: string | JSX.Element | JSX.Element[] }> = (props): JSX.Element => {
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
                    uniqueKey: "errorCell1",
                    content: <>{props.children}</>,
                    widths: { smWidth: 12 }
                  },
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
