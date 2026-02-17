import { IHtmlProps } from "./iHtmlProps";
import renderHTML from "react-render-html";
import * as React from "react";
import { useListItemContext } from "../../helper/ListItemContext";
import { mapListItemToObject } from "../../listItem/mapper/ListItemToObjectMapper";
const format: any = require("string-template");
export const Html: (props: IHtmlProps) => JSX.Element = (props: IHtmlProps) => {
  const itemContext = useListItemContext();

  const dataObjectForPlaceHolder = mapListItemToObject(itemContext.getListItem());
  const replacedHtml = format(props.html !== null ? props.html : "", dataObjectForPlaceHolder);
  return <span className="htmlContent">{renderHTML(replacedHtml)}</span>;
};
