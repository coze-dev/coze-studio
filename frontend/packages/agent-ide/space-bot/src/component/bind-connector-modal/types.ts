export type TFormData = Record<string, string>;

export type TSubmitValue = Record<string, string>;

export interface FormActions {
  submit: () => Promise<TSubmitValue>;
  reset: () => void;
}
