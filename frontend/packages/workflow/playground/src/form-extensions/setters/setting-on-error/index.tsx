import React from 'react';

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { SettingOnError } from '@/form-extensions/components/setting-on-error';

import { withValidation } from '../../components/validation';

const SettingOnErrorWithValidation = withValidation(
  ({ value, onChange, readonly, context, options }: SetterComponentProps) => (
    <SettingOnError
      value={value}
      onChange={onChange}
      readonly={readonly}
      context={context}
      options={options}
    ></SettingOnError>
  ),
);

export const settingOnErrorSetter = {
  key: 'SettingOnError',
  component: SettingOnErrorWithValidation,
};
