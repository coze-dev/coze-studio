import { useState } from 'react';

import { isNumber } from 'lodash-es';
import {
  type PluginModalModeProps,
  type PluginQuery,
} from '@coze-agent-ide/plugin-shared';

import { PluginModal } from './plugin-modal';

export const usePluginApisModal = (props?: PluginModalModeProps) => {
  const { closeCallback, ...restProps } = props || {};
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState(1);
  const [initQuery, setInitQuery] = useState<Partial<PluginQuery>>();
  const open = (
    params?: number | { openType?: number; initQuery?: Partial<PluginQuery> },
  ) => {
    const openType = isNumber(params) ? params : params?.openType;
    const _initQuery = isNumber(params) ? undefined : params?.initQuery;
    setVisible(true);
    setInitQuery(_initQuery);
    // 0 也有效
    if (isNumber(openType)) {
      setType(openType);
    }
  };
  const close = () => {
    setVisible(false);
    setInitQuery(undefined);
    closeCallback?.();
  };
  const node = visible ? (
    <PluginModal
      type={type}
      visible={visible}
      onCancel={() => {
        setVisible(false);
        closeCallback?.();
      }}
      initQuery={initQuery}
      footer={null}
      {...restProps}
    />
  ) : null;
  return {
    node,
    open,
    close,
  };
};
