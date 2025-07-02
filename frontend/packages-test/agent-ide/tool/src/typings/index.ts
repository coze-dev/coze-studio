import { type ToolKey } from '@coze-agent-ide/tool-config';

export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

export type NonNullableType<T> = {
  [P in keyof T]: Exclude<T[P], null>;
};

export type EmptyFunc = () => void | Promise<void>;

export interface ToolEntryCommonProps {
  title: string;
  toolKey?: ToolKey;
}
