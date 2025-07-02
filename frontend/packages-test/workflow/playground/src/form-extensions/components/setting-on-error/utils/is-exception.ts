import {
  SettingOnErrorProcessType,
  type SettingOnErrorValue,
} from '@coze-workflow/nodes';

export const isException = (settingOnError?: SettingOnErrorValue) =>
  !!(
    settingOnError?.settingOnErrorIsOpen &&
    settingOnError?.processType === SettingOnErrorProcessType.EXCEPTION
  );
