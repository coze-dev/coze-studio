export interface PromptEditorProps {
  className?: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  readonly: boolean;
  value: string;
  isSingle: boolean;
}
