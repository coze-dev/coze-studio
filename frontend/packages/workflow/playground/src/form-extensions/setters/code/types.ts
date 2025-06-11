export interface CodeEditorValue {
  language: number;
  code?: string;
}

export interface CodeEditProps {
  value?: CodeEditorValue;
  onChange?: (value?: CodeEditorValue) => void;
}
