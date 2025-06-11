import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';
import {
  type ViewVariableTreeNode,
  type SettingOnErrorValue,
} from '@coze-workflow/nodes';

export { SettingOnErrorValue } from '@coze-workflow/nodes';

export interface SettingOnErrorProps extends Partial<SetterComponentProps> {
  value: SettingOnErrorValue;
  onChange: (value: SettingOnErrorValue) => void;
  batchModePath?: string;
  outputsPath?: string;
  noPadding?: boolean;
  isBatch?: boolean;
}

export interface ErrorFormProps extends Pick<SettingOnErrorProps, 'noPadding'> {
  isOpen?: boolean;
  json?: string;
  onSwitchChange: (isOpen: boolean) => void;
  onJSONChange: (json?: string) => void;
  readonly?: boolean;
  errorMsg?: string;
  defaultValue?: string;
  outputs?: ViewVariableTreeNode[];
}

export type ErrorFormPropsV2 = ErrorFormProps &
  Pick<SettingOnErrorProps, 'value' | 'onChange' | 'isBatch'> & {
    syncOutputs?: (isOpen: boolean) => void;
  };

export interface SettingOnErrorItemProps<T> {
  value?: T;
  onChange?: (value?: T) => void;
  readonly?: boolean;
}
