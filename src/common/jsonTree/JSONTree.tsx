import React, { useState } from "react";
import { FlexTable } from "../actions/components/flexTable/FlexTable";
import { FlexRow } from "../actions/components/flexTable/FlexRow";
import { FlexCell } from "../actions/components/flexTable/FlexCell";
import { getType } from "./TypeCheck";
import log from "loglevel";

type JsonTreeProps = {
  data: any;
};

export const JsonTree = (props: JsonTreeProps): JSX.Element => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  log.debug("rendering jsontree");

  if (props.data === undefined || props.data === null) {
    return <>null</>;
  }

  const toggleCollapse = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const t = getType(props.data);
  if (t === "primitive") {
    return <div>{props.data.toString()}</div>;
  }

  if (t === "date") {
    const date = props.data as Date;
    return <div>{date.toString()}</div>;
  }

  if (t === "array") {
    return (
      <div>
        {props.data.map(
          (d, index): JSX.Element => (
            <JsonTree key={index} data={d} />
          )
        )}
      </div>
    );
  }

  if (t === "object") {
    const keys = Object.keys(props.data);
    return (
      <>
        {keys.map((k) => (
          <FlexTable key={k}>
            <FlexRow>
              <FlexCell>
                <button type="button" onClick={() => toggleCollapse(k)}>
                  {collapsed[k] ? "+" : "-"}
                </button>
                {k}:
              </FlexCell>
              {!collapsed[k] && (
                <FlexCell>
                  <div style={{ paddingLeft: 15 }}>
                    <JsonTree data={props.data[k]} />
                  </div>
                </FlexCell>
              )}
            </FlexRow>
          </FlexTable>
        ))}
      </>
    );
  }

  return <div>unknown</div>;
};
