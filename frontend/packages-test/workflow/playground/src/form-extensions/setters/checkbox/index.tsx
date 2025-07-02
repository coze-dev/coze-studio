import { type FC } from 'react';

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { Checkbox as BaseCheckbox } from '../../components/checkbox';

export type CheckboxProps = SetterComponentProps<
  boolean,
  { text: string; itemTooltip?: string }
>;

export const Checkbox: FC<CheckboxProps> = props => <BaseCheckbox {...props} />;

export const checkbox = {
  key: 'checkbox',
  component: Checkbox,
};
