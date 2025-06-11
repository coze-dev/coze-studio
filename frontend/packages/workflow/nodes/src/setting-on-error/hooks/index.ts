import { type StandardNodeType } from '@coze-workflow/base/types';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';

import { isSettingOnErrorV2, isSettingOnError } from '../utils';

export const useIsSettingOnErrorV2 = () => {
  const node = useCurrentEntity();

  return isSettingOnErrorV2(node.flowNodeType as StandardNodeType);
};

export const useIsSettingOnError = () => {
  const node = useCurrentEntity();

  return isSettingOnError(node.flowNodeType as StandardNodeType);
};

export { useTimeoutConfig } from './use-timeout-config';
