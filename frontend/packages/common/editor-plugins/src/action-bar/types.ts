import { type ButtonProps } from '@coze/coze-design';

export interface ActionController {
  hideActionBar: () => void;
  rePosition: (position?: 'topLeft' | 'bottomRight') => void;
}
export type ActionSize = ButtonProps['size'];
