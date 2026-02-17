import { ListItemField } from "../base/ListItemField";
import { UrlValue } from "../valueTypes/UrlValue";
import { UrlFieldDescription } from "./UrlFieldDescription";

export interface UrlFieldProperty extends ListItemField<UrlFieldDescription, UrlValue | undefined> {}
