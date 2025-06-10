import {
  type SettingOnErrorValue,
  useTimeoutConfig,
} from '@coze-workflow/nodes';

/**
 * 是否展开
 * @param settingOnError
 * @returns
 */
export const useExpand = (settingOnError: SettingOnErrorValue) => {
  const defaultConfig = useTimeoutConfig().default;

  if (settingOnError?.settingOnErrorIsOpen) {
    return true;
  }

  if (settingOnError?.retryTimes) {
    return true;
  }

  if (
    settingOnError?.timeoutMs &&
    settingOnError?.timeoutMs !== defaultConfig
  ) {
    return true;
  }
  return false;
};
