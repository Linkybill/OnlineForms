import { IList } from "@pnp/sp/lists";
import { Filter } from "../../../dynamicFilter/models/Filter";
import { FieldTypeNames } from "../../../listItem/FieldTypeNames";
import { OrderByField } from "../models/OrderByField";

/**
 * This is a helper class to build CAML queries to use it in SP API requests.
 *
 * @see https://docs.microsoft.com/de-de/sharepoint/dev/schema/query-schema
 */
export class CamlHelper {
  // todo: make caml helper threadsafe.  ✅ now: no shared static state.

  /**
   * Modifies an CAML with filter and order information and return modified CAML.
   *
   * @param camlXml The CAML XML structure.
   * @param filter An array of Filter objects to be parsed to CAML XML.
   * @param orderByFields An array of OrderByField objects to be parsed to CAML XML.
   * @returns Serialized CAML XML string.
   *
   */
  public static modifyViewWithFilterAndSorting(camlXml: string, filter: Filter[], orderByFields: OrderByField[], clearDefaultFiltersFromView: boolean): string {
    const doc = this.parseCamlXmlToDocument(camlXml);

    if (clearDefaultFiltersFromView === true) {
      const parser = new DOMParser();

      // Finde das <Where>-Element und lösche es
      const whereElement = doc.querySelector("Where");
      if (whereElement) {
        whereElement.parentNode?.removeChild(whereElement);
      }
    }

    const filtersGroupedByInternalName: {
      [internalName: string]: Filter;
    } = {};
    filter.forEach((f) => {
      if (filtersGroupedByInternalName[f.fieldName] === undefined) {
        filtersGroupedByInternalName[f.fieldName] = f;
      } else {
        filtersGroupedByInternalName[f.fieldName].values.push(...f.values);
      }
    });

    const keys = Object.keys(filtersGroupedByInternalName);
    const allFilters = keys.map((key) => filtersGroupedByInternalName[key]);

    allFilters.forEach((f: Filter) => {
      {
        this.addExpressionToCaml(doc, f, filter);
      }
    });

    if (orderByFields.length > 0) {
      const orderByElement = this.createOrderByElement(doc, orderByFields);
      this.addOrderByElementToCaml(doc, orderByElement);
    }

    return this.serializeDocumentToCamlXml(doc);
  }

  public static ensureViewToBeRecursive(camlXml: string): string {
    const doc = this.parseCamlXmlToDocument(camlXml);
    const view = doc.getElementsByTagName("View")[0];
    view.setAttribute("Scope", "Recursive");

    return this.serializeDocumentToCamlXml(doc);
  }

  public static ensureRowLimitInCaml(camlXml: string, limit: number = 5000): string {
    const doc = this.parseCamlXmlToDocument(camlXml);
    const rowLimitElements = doc.getElementsByTagName("RowLimit");
    const viewElement = doc.getElementsByTagName("View")[0];

    if (!viewElement) return camlXml;

    if (rowLimitElements.length > 0) {
      // RowLimit existiert bereits → aktualisieren
      const rowLimit = rowLimitElements[0];
      rowLimit.textContent = limit.toString();
      rowLimit.setAttribute("Paged", "FALSE");
    } else {
      // Neu erstellen und einfügen (nach <Query>, wenn vorhanden)
      const newRowLimit = doc.createElement("RowLimit");
      newRowLimit.setAttribute("Paged", "FALSE");
      newRowLimit.textContent = limit.toString();

      const queryElement = viewElement.getElementsByTagName("Query")[0];
      if (queryElement) {
        viewElement.insertBefore(newRowLimit, queryElement.nextSibling);
      } else {
        viewElement.appendChild(newRowLimit);
      }
    }
    return this.serializeDocumentToCamlXml(doc);
  }

  /**
   * Add "Contains" element to CAML after full-text-search.
   * Resulting structure is:
   * <View>
   *   <Query>
   *     <Where>
   *       <Contains>...</Contains>
   *     </Where>
   *   </Query>
   * </View>
   * or
   * <View>
   *   <Query>
   *     <Where>
   *       <And>
   *         <Contains>...</Contains>
   *         <FIRST ELEM OF WHERE BEFORE ADDING NEW CONTAINS>
   *       </And>
   *     </Where>
   *   </Query>
   * </View>
   *
   * @param camlXml The CAML XML structure.
   * @param fieldName
   * @param filterValue
   * @param fieldType
   * @returns Serialized CAML XML string.
   */
  public static addContainsClauseToView(camlXml: string, fieldName: string, filterValue: string, fieldType: string): string {
    const doc = this.parseCamlXmlToDocument(camlXml);
    const whereElement = this.getEnsuredWhereElement(doc);
    const fieldRefElement = this.createFieldRefElement(doc, fieldName);
    const valueElement = this.createValueElement(doc, fieldType, filterValue);
    const containsElement = this.createContainElement(doc, fieldRefElement, valueElement);

    if (whereElement.hasChildNodes()) {
      const currentWhereCondition = whereElement.childNodes[0] as Element;
      const andElement = this.createAndElement(doc, containsElement, currentWhereCondition);

      whereElement.appendChild(andElement);
      let serialized = this.serializeDocumentToCamlXml(doc);
      return serialized;
    }

    whereElement.appendChild(containsElement);
    let serialized = this.serializeDocumentToCamlXml(doc);

    return serialized;
  }

  public static async ensureAllFieldsInViewFromSharePoint(camlXml: string, list: IList): Promise<string> {
    // 1. CAML laden
    const doc = this.parseCamlXmlToDocument(camlXml);

    const view = doc.getElementsByTagName("View")[0];
    if (!view) return camlXml;

    // 2. Felder direkt aus SharePoint holen
    const spFields = await list.fields.get();
    // spFields = echte SP-Felder inkl. Hidden, ReadOnly, System, etc.

    // 3. Existierende ViewFields entfernen
    const existing = view.getElementsByTagName("ViewFields")[0];
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    // 4. Neue <ViewFields> erstellen
    const viewFields = doc.createElement("ViewFields");

    for (const spField of spFields) {
      const internalName = spField.InternalName;

      const fieldRef = doc.createElement("FieldRef");
      fieldRef.setAttribute("Name", internalName);

      viewFields.appendChild(fieldRef);
    }

    // 5. Einfügen vor <Query> oder ans Ende
    const query = view.getElementsByTagName("Query")[0];
    const rowLimit = view.getElementsByTagName("RowLimit")[0];

    if (query) {
      view.insertBefore(viewFields, query);
    } else if (rowLimit) {
      view.insertBefore(viewFields, rowLimit);
    } else {
      view.appendChild(viewFields);
    }

    // 6. CAML zurückgeben
    return this.serializeDocumentToCamlXml(doc);
  }

  /**
   * Adds an "And" element into CAML XML.
   * Example: <Query><Where><SOME_ELEMENT /></Where></Query> -> <Query><Where><And><SOME_ELEMENT /></And></Where></Query>
   * @see https://docs.microsoft.com/de-de/sharepoint/dev/schema/and-element-query
   *
   * @param andElement The "And" element to append.
   * @returns The modified CAML containing new "And" element.
   *
   */
  private static addAndElementToCaml(doc: Document): Element {
    const whereElement = this.getEnsuredWhereElement(doc);
    const firstNodeInWhere = whereElement.childNodes[0];

    const and = doc.createElement("And");
    and.appendChild(firstNodeInWhere);
    whereElement.appendChild(and);
    return and;
  }

  /**
   * Adds a "OrderBy" element into given CAML XML.
   *
   * @param orderByElement Element object of "OrderBy" element to be inserted.
   * @returns The modified CAML containing new "OrderBy" element.
   */
  private static addOrderByElementToCaml(doc: Document, orderByElement: Element) {
    const query: Element = this.getEnsuredQueryElement(doc);
    this.removeChildElementsByType(doc, query, "OrderBy");

    query.appendChild(orderByElement);
  }

  private static addExpressionToCaml(doc: Document, filter: Filter, allFilters: Filter[], clearDefaultFilterFromView?: boolean): Element {
    const whereElement = this.getEnsuredWhereElement(doc);
    let nodeWhichShouldContainCondition = whereElement;
    if (whereElement.hasChildNodes()) {
      const currentWhereCondition = whereElement.childNodes[0] as Element;
      const andElement = this.addAndElementToCaml(doc);
      andElement.appendChild(currentWhereCondition);
      nodeWhichShouldContainCondition = andElement;
    }
    if (filter.fieldType === "MultiChoice") {
      const orQueryPartAsString = this.createContainsConditionsWithOr(filter, "");
      var parser = new DOMParser();
      var element = parser.parseFromString(orQueryPartAsString, "application/xml");

      nodeWhichShouldContainCondition.appendChild(element.children[0]);
    } else {
      const inElement = this.createInElement(doc, filter);
      nodeWhichShouldContainCondition.appendChild(inElement);
      return inElement;
    }
  }

  private static createContainsConditionsWithOr(filter: Filter, createdFilter: string = ""): string {
    if (filter.values.length === 0) {
      return createdFilter;
    }
    if (filter.values.length === 1) {
      return createdFilter + this.createContainsConditionAsString(filter, filter.values[0]);
    }
    if (filter.values.length === 2) {
      const filterValue1 = filter.values.shift()!;
      const filterValue2 = filter.values.shift()!;
      return createdFilter + "<Or>" + this.createContainsConditionAsString(filter, filterValue1) + this.createContainsConditionAsString(filter, filterValue2) + "</Or>";
    } else {
      const filterValue1 = filter.values.shift()!;
      const newFilter = createdFilter + "<Or>" + this.createContainsConditionAsString(filter, filterValue1);
      const innerFilter = this.createContainsConditionsWithOr(filter, newFilter);
      return innerFilter + "</Or>";
    }
  }

  private static createContainsConditionAsString(filter: Filter, valueToUse: string): string {
    return "<Contains><FieldRef Name='" + filter.fieldName + "'/><Value Type='" + "Text" + "'><![CDATA[" + valueToUse + "]]></Value></Contains>";
  }

  /**
   * Ensures an existing "Where" element in caml xml structure.
   * Ensures Structure:
   * <View>
   *   <Query>
   *     <Where></Where>
   *   </Query>
   * </View>
   *
   * @param caml Document object that handles caml xml structure.
   * @returns The (modified) CAML with "Where" element.
   */
  private static getEnsuredWhereElement(doc: Document): Element {
    const whereElements = doc.getElementsByTagName("Where");
    if (whereElements.length > 0) {
      return whereElements[0];
    }

    const queryElement: Element = this.getEnsuredQueryElement(doc);
    const whereElement = doc.createElement("Where");
    queryElement.appendChild(whereElement);
    return whereElement;
  }

  /**
   * Ensures an existing "Query" element in given CAML XML.
   *
   * @returns The (modified) CAML XML with "Query" element.
   */
  private static getEnsuredQueryElement(doc: Document): Element {
    const queryElements = doc.getElementsByTagName("Query");

    if (queryElements.length !== 0) {
      return queryElements[0];
    }
    const viewElement: Element = doc.getElementsByTagName("View")[0];
    const queryElement = doc.createElement("Query");
    viewElement.appendChild(queryElement);
    return queryElement;
  }

  /**
   * Creates an "Contains" element to use in CAML queries.
   *
   * @param fieldRefElement "FieldRef" element to append to "Contain".
   * @param valueElement "Value" element to append to "Contain".
   * @returns The created "Contains" element.
   */
  private static createContainElement(doc: Document, fieldRefElement: Element, valueElement: Element): Element {
    const contains = doc.createElement("Contains");
    contains.appendChild(fieldRefElement);
    contains.appendChild(valueElement);

    return contains;
  }

  /**
   * Creates an "And" element to use in CAML queries.
   * Structure:
   * <And></And>
   * @see https://docs.microsoft.com/de-de/sharepoint/dev/schema/and-element-query
   *
   * @param firstAndElement First Element to represent first condition of "And" element.
   * @param secondAndElement Second Element to represent first condition of "And" element.
   * @returns The created "And" elelement.
   */
  private static createAndElement(doc: Document, firstAndElement: Element, secondAndElement: Element): Element {
    const andElement = doc.createElement("And");
    andElement.appendChild(firstAndElement);
    andElement.appendChild(secondAndElement);

    return andElement;
  }

  /**
   * Creates an "In" element to use in CAML queries.
   * Structure:
   * <In>
   *   <FieldRef Name="${filter.fieldName}"></FieldRef>
   *   <Values></Values>
   * </In>
   * @see https://docs.microsoft.com/de-de/sharepoint/dev/schema/in-element-query
   *
   * @param filter Filter object to parse its values to generated "in" element.
   * @param fieldType Field type string to be rendered into "Type" attribute in "Value" element.
   * @returns The created "In" elelement.
   */
  private static createInElement(doc: Document, filter: Filter): Element {
    const inElement = doc.createElement("In");
    inElement.setAttribute("id", filter.fieldName);

    const fieldRef = this.createFieldRefElement(doc, filter.fieldName);
    if (filter.fieldType == FieldTypeNames.Lookup || filter.fieldType == FieldTypeNames.LookupMulti) {
      fieldRef.setAttribute("LookupId", "TRUE");
    }
    const values = doc.createElement("Values");

    filter.values.forEach((filterValue: string) => {
      const valueElement = this.createValueElement(doc, filter.fieldType, filterValue);
      values.appendChild(valueElement);
    });

    inElement.appendChild(fieldRef);
    inElement.appendChild(values);

    return inElement;
  }

  /**
   * Creates an "FieldRef" element.
   * @see https://docs.microsoft.com/de-de/sharepoint/dev/schema/fieldref-element-query
   *
   * @param nameAttributeValue Value of FieldRefs "Name" attribute.
   * @param ascending Flag, true to define acending order, false to descending order.
   * @returns The created "FieldRef" element as Element object.
   */
  private static createFieldRefElement(doc: Document, nameAttributeValue: string, ascending?: boolean): Element {
    const fieldRefElement = doc.createElement("FieldRef");
    fieldRefElement.setAttribute("Name", nameAttributeValue);

    if (typeof ascending !== "undefined") {
      const ascendingAttributeValue: string = ascending ? "TRUE" : "FALSE";
      fieldRefElement.setAttribute("Ascending", ascendingAttributeValue);
    }

    return fieldRefElement;
  }

  /**
   * Creates and returns a "Value" element.
   * Structure: <Value Type="${fieldType}">${value}</Value>
   * @see https://docs.microsoft.com/de-de/sharepoint/dev/schema/value-element-query
   *
   * @param fieldType The field type to be set as value at "Value" elmeents "Type" attribute.
   * @param value The value to be set to "Value" element
   *
   * @returns The created "Value" element
   */
  private static createValueElement(doc: Document, fieldType: string, value: string): Element {
    const valueElement = doc.createElement("Value");

    if (fieldType == "Lookup" || fieldType == "LookupMulti") {
      valueElement.setAttribute("Type", "Integer");
      valueElement.innerHTML = value;
    } else {
      valueElement.setAttribute("Type", fieldType);
      valueElement.innerHTML = "<![CDATA[" + value + "]]>";
    }

    return valueElement;
  }

  /**
   * Creates and returns a "OrderBy" element.
   * <OrderBy>
   *   <FieldRef
   *     Ascending = "TRUE" | "FALSE"
   *     Name = "Text" />
   *   ...
   * </OrderBy>
   * @see https://docs.microsoft.com/de-de/sharepoint/dev/schema/orderby-element-query
   *
   * @param orderByFields Array of OrderByField objects to add as FieldRef elements into "OrderBy"
   * @returns The created "OrderBy" element
   */
  private static createOrderByElement(doc: Document, orderByFields: OrderByField[]): Element {
    const orderByElement = doc.createElement("OrderBy");

    orderByFields.forEach((field: OrderByField) => {
      const fieldRefElement = this.createFieldRefElement(doc, field.fieldName, field.ascending);
      orderByElement.appendChild(fieldRefElement);
    });

    return orderByElement;
  }

  /**
   * Remove all child elements of type <elementType> from <element> and return cleaned element.
   *
   * @param element The element to empty.
   * @param elementType the element type of elements to be removed from element.
   * @returns The cleaned element.
   */
  private static removeChildElementsByType(doc: Document, element: Element, elementTypeToRemove: string): Element {
    const elementsToRemove = element.getElementsByTagName(elementTypeToRemove);

    for (let i = 0; i < elementsToRemove.length; i++) {
      element.removeChild(elementsToRemove[i]);
    }

    return element;
  }

  /**
   * Parse CAML XML string to a Document object
   *
   * @param camlXml XML string based configuration of list view
   * @returns Document parsed from view XML string
   */
  private static parseCamlXmlToDocument(camlXml: string): Document {
    return new window.DOMParser().parseFromString(camlXml, "text/xml");
  }

  /**
   * Serialize document object to list view XML string.
   *
   * @param doc Document object to be parsed to a XML string
   * @returns The parsed XML string representing the list view configuration.
   */
  private static serializeDocumentToCamlXml(doc: Document): string {
    return new XMLSerializer().serializeToString(doc);
  }
}
