import { type ButtonProps } from '@coze-arch/coze-design';

export interface ActionController {
  hideActionBar: () => void;
  rePosition: (position?: 'topLeft' | 'bottomRight') => void;
}
export type ActionSize = ButtonProps['size'];
