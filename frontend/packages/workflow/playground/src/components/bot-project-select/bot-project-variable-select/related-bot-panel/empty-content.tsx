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

import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozEmpty } from '@coze-arch/coze-design/icons';

import s from '../index.module.less';

export default function EmptyContent() {
  return (
    <div className={s['empty-block']}>
      <IconCozEmpty
        style={{ fontSize: '32px', color: 'rgba(52, 60, 87, 0.72)' }}
      />
      <span className={s.text}>
        {I18n.t(
          'variable_binding_there_are_no_variables_in_this_project',
          {},
          '该智能体下暂时没有定义变量',
        )}
      </span>
    </div>
  );
}
