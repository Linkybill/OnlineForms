import * as React from "react";

export type AccordionIndex = number | number[];
export type AccordionToggleEvent<E = HTMLElement> = React.MouseEvent<E> | React.KeyboardEvent<E>;

export interface AccordionContextValue {
  navigable: boolean;
}

export interface AccordionContextValues {
  accordion: AccordionContextValue;
}

export interface AccordionCommons {
  /**
   * Indicates if keyboard navigation is available
   */
  navigable: boolean;
  /**
   * Indicates if Accordion support multiple Panels opened at the same time
   */
  multiple: boolean;
  /**
   * Indicates if Accordion support multiple Panels closed at the same time
   */
  collapsible: boolean;
}
