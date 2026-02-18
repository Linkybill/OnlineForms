import { FormTemplate } from "../../../extensions/common/models/FormTemplate";
import { FormContent } from "./FormContent";

export interface FormViewModel {
  formTemplate: FormTemplate | undefined;
  formContent: FormContent | undefined;
}
