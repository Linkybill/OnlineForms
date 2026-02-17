import { JSONLogicInstance } from "./JSONLogicInstance";
import { createDataForJsonLogic } from "./ObjectByPathHelper";
import type { ListItem } from "../listItem/ListItem";
import { IListItemAccessor } from "./ListItemContext";
import { PermissionInfos } from "./PermissionContext";

type JsonLogic = any;
type VarValue = string | [string, any];
type VarExpr = { var: VarValue };

export class JsonLogicHelper {
  constructor(private readonly componentContext: any, private readonly itemAccessor: IListItemAccessor, private readonly listItemId: number, private readonly permissionInfos: PermissionInfos) {}

  /**
   * Führt eine JSONLogic-Expression aus (String oder Objekt).
   * - listItem.* und datasources.* werden vorab ausgewertet
   * - Ergebnis wird als Literal in den Ausdruck eingesetzt
   * - danach normal gegen das DataObject ausgeführt
   */
  public evaluate<T = any>(expression: string | JsonLogic, listItem: ListItem, datasourceResults: { [key: string]: any }): T {
    const expressionObject = typeof expression === "string" ? JSON.parse(expression) : expression;

    const dataObject = createDataForJsonLogic(listItem, datasourceResults);

    const engine = JSONLogicInstance.Instance(this.componentContext, this.itemAccessor, this.listItemId, this.permissionInfos);

    const bakedExpression = this.bake(expressionObject, dataObject, engine);

    return engine.apply(bakedExpression, dataObject) as T;
  }

  // ---------------------------------------------------------------------------
  // internals
  // ---------------------------------------------------------------------------

  private bake(expression: JsonLogic, rootData: any, engine: { apply: (logic: any, data: any) => any }): JsonLogic {
    const cache = new Map<string, any>(); // dedupe nur innerhalb dieses Calls

    const transform = (node: any): any => {
      if (Array.isArray(node)) return node.map(transform);

      if (JsonLogicHelper.isObject(node)) {
        if (this.isVarExpr(node)) {
          const varValue = node.var as VarValue;
          const path = JsonLogicHelper.getVarPath(varValue);
          if (typeof path !== "string") {
            return node;
          }

          if (path.startsWith("listItem.") || path.startsWith("datasources.")) {
            const key = JsonLogicHelper.makeVarKey(varValue);

            if (!cache.has(key)) {
              const value = engine.apply(node, rootData);
              cache.set(key, value);
            }

            // 👉 Literal einsetzen
            return cache.get(key);
          }

          return node; // lokale item-vars bleiben
        }

        const out: Record<string, any> = {};
        for (const [k, v] of Object.entries(node)) {
          out[k] = transform(v);
        }
        return out;
      }

      return node;
    };

    return transform(expression);
  }

  private isVarExpr(node: any): node is VarExpr {
    return JsonLogicHelper.isObject(node) && Object.keys(node).length === 1 && Object.prototype.hasOwnProperty.call(node, "var");
  }

  private static isObject(v: unknown): v is Record<string, any> {
    return typeof v === "object" && v !== null && !Array.isArray(v);
  }

  private static getVarPath(v: VarValue): string {
    return Array.isArray(v) ? v[0] : v;
  }

  private static makeVarKey(v: VarValue): string {
    return Array.isArray(v) ? `${v[0]}|default:${JSON.stringify(v[1])}` : v;
  }
}
