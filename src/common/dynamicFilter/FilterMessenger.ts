import { Filter } from "./models/Filter";
import { FilterMessage } from "./models/FilterMessage";
import log from "loglevel";

export const sendFilter = (datasourceId: string, filter: Filter[], overwriteFilter?: boolean): void => {
  const message: FilterMessage = {
    datasourceId: addTypeIdentifierToDatasourceId(datasourceId),
    filter: filter,
    overwriteFilterInTarget: overwriteFilter
  };

  log.debug("going to send filter", message);

  window.postMessage(message, window.location.href);
};

export const consumeFilter = (datasourceId: string, onFilterReceived: (filterMessage: FilterMessage) => void) => {
  log.debug("going to consume filter for ", datasourceId);
  const datasourceWithType = addTypeIdentifierToDatasourceId(datasourceId);
  window.addEventListener("message", (event: MessageEvent<FilterMessage>) => {
    // todo swtich to event.data.datasouceId
    log.debug("consume filter, checking for filter message: ", {
      datasourceIdInEvent: event.data.datasourceId,
      registeredDatasource: datasourceWithType
    });
    if (event.data.datasourceId === datasourceWithType) {
      log.trace("received filter", event);
      onFilterReceived(event.data);
    }
  });
};

const addTypeIdentifierToDatasourceId = (datasourceId: string): string => datasourceId + "||filterMessage";
