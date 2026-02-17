export interface ValidationRule {
  description: string;
  validationRule: string;
  condition: string;
  validationType: string[];
  errorMessageOnFail: string;
  isActive: boolean;
}
