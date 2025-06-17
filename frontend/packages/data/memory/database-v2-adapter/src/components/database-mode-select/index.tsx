import React, { type FC } from 'react';

import { type CommonexcludeType } from '@coze-arch/bot-semi/Form';
import { type BotTableRWMode } from '@coze-arch/bot-api/memory';
import { type CommonFieldProps, withField } from '@coze-arch/coze-design';
export interface DatabaseModeSelectProps {
  disabled?: boolean;
  type?: 'button' | 'select';
  value?: BotTableRWMode;
  options?: BotTableRWMode[];
  onChange?: (value: BotTableRWMode) => void;
}

export const DatabaseModeSelect: FC<DatabaseModeSelectProps> = () => <></>;

export const FormDatabaseModeSelect: React.FunctionComponent<
  CommonFieldProps & Omit<DatabaseModeSelectProps, keyof CommonexcludeType>
> = withField(DatabaseModeSelect, {
  valueKey: 'value',
  onKeyChangeFnName: 'onChange',
});
