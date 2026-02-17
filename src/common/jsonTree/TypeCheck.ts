export function getType(value: any): "primitive" | "array" | "date" | "object" | "unknown" {
  if (isPrimitive(value)) return "primitive";
  if (isArray(value)) return "array";
  if (isDate(value)) return "date";
  if (isObject(value)) return "object";
  return "unknown";
}

export function isPrimitive(value: any): boolean {
  return value === null || (typeof value !== "object" && typeof value !== "function" && isArray(value) === false && isDate(value) === false);
}

export function isArray(value: any): boolean {
  return Array.isArray(value);
}

export function isDate(value: any): boolean {
  return value instanceof Date;
}

export function isObject(value: any): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date);
}
