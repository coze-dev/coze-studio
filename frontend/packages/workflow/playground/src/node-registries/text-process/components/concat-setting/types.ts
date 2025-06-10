export interface FormField {
  field: string;
  label: string;
  tooltip?: string;
  required: boolean;
  component: string;
  defaultValue?: unknown;
  componentProps?: Record<string, unknown>;
}

export interface SettingInfo {
  formTitle: string;
  formDescription: string;
}
