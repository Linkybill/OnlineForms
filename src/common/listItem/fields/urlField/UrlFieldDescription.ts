import { FieldDescription } from "../base/FieldDescription";
import { UrlValue } from "../valueTypes/UrlValue";

export interface UrlFieldDescription extends FieldDescription<UrlValue | undefined> {
  isImageUrl: boolean | undefined;
}
