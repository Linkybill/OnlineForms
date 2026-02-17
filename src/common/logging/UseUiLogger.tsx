import log from "loglevel";
import { useState } from "react";

export function useUILogger() {
  const [logs, setLogs] = useState<any[]>([]);

  // Nur diese Logs werden in der UI angezeigt
  const logToUI = (message: any) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  return { logs, log, logToUI };
}
