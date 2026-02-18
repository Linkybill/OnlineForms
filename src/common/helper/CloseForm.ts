import { QueryParameterNames } from "../../webparts/formInstanceOnline/models/Constants";

export const closeFormWithRedirect = () => {
  const params = new URLSearchParams(location.search);
  if (params.has(QueryParameterNames.source)) {
    const formId = params.get(QueryParameterNames.source);
    const sourceUrl = decodeURIComponent(formId);
    window.location.href = sourceUrl;
  } else {
    window.location.href = "/";
  }
};
