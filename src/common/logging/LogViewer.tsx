import React from "react";
import { JsonTree } from "../jsonTree/JSONTree";
// If you're using Immutable.js: `npm i --save immutable`
// Props, um Logs von außen zu übergeben
interface LogViewerProps {
  logs: any[]; // Logs können komplexe Objekte sein
}

export const LogViewer: React.FC<LogViewerProps> = (props: LogViewerProps) => {
  return (
    <>
      jsontree::::
      <JsonTree data={props.logs} />
    </>
  );
};
