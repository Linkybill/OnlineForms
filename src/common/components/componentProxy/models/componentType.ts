import { createElement } from "react";
import { FieldSet } from "../../fieldSet/FieldSet";
import { ComponentGrid } from "../../grid/componentGrid";
import { Html } from "../../htmlComponent/htmlComponent";
import { Register } from "../../register/components/Register";
import { IRegisterProps } from "../../register/types";
import { FieldPlaceholderComponent } from "../../../listItem/fields/fieldPlaceholder/FieldPlaceholderComponent";

export const register = (props: IRegisterProps) => createElement(Register, { ...props });

export type ComponentType = typeof register | typeof ComponentGrid | typeof Html | typeof FieldSet | typeof FieldPlaceholderComponent;
