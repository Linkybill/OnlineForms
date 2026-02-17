import { FieldDescription } from "../base/FieldDescription";

export interface NoteFieldDescription extends FieldDescription<string> {
  numberOfLines: number;
  fullHtml: boolean;
}
