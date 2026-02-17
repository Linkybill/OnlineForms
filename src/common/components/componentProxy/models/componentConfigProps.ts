import { FieldDescription } from "../../../listItem/fields/base/FieldDescription";
import { FieldValueTypes } from "../../../listItem/types/FieldValueTypes";
import { IFieldSetProps } from "../../fieldSet/IFieldSetProps";
import { IComponentGridProps } from "../../grid/models/componentGridProps";
import { IHtmlProps } from "../../htmlComponent/iHtmlProps";
import { IRegisterProps } from "../../register/types";
import { IComponentReactConfig } from "./IComponentReactConfig";

export type ComponentConfigProps = IRegisterProps | IComponentGridProps | IHtmlProps | IComponentReactConfig | IFieldSetProps | (IComponentGridProps & { showToolpane?: boolean }) | FieldDescription<FieldValueTypes>;
