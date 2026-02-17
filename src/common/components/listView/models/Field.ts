import { IFieldInfo } from "@pnp/sp/fields";

export interface Field {
  name: string;
  displayName: string;
  type: string;
  fieldInfo: IFieldInfo;
}
