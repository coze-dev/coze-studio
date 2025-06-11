export interface ValidationError {
  message: string;
  path: string | string[];
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OnTestRunValidate = (callback: () => void) => any;

export interface ValidationContextProps {
  errors: ValidationError[];
  onTestRunValidate: OnTestRunValidate;
}

export interface ValidationProviderProps {
  errors: ValidationError[];
  children: React.ReactNode;
  onTestRunValidate: OnTestRunValidate;
}
