import { type FC } from 'react';

import { type SettingOnErrorProps } from './types';
import { useSettingOnError } from './hooks/use-setting-on-error';
import { ErrorForm } from './error-form';
import { ErrorForm as ErrorFormV2 } from './components';

export const SettingOnError: FC<SettingOnErrorProps> = ({
  value,
  onChange,
  batchModePath,
  outputsPath,
  readonly,
  context,
  options,
  noPadding,
}) => {
  const { isSettingOnErrorV2, ...settingOnError } = useSettingOnError({
    value,
    onChange,
    batchModePath,
    outputsPath,
    context,
    options,
  });
  if (isSettingOnErrorV2) {
    return (
      <ErrorFormV2
        {...settingOnError}
        readonly={readonly}
        noPadding={noPadding}
      />
    );
  }
  return (
    <ErrorForm {...settingOnError} readonly={readonly} noPadding={noPadding} />
  );
};
