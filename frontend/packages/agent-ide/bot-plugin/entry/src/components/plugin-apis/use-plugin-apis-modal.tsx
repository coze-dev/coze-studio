/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    // 0 is also valid
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
