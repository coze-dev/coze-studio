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

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozLoading } from '@coze-arch/coze-design/icons';

import styles from './styles.module.less';

export default function RunningPanel() {
  return (
    <div
      className={cls(
        'w-full h-full absolute flex flex-col items-center justify-center bg-white',
        styles['content-bg-color'],
      )}
    >
      <IconCozLoading className="animate-spin coz-fg-dim mb-[4px] text-[32px]" />
      <span className={'text-[14px]'}>
        {I18n.t('workflow_testset_testruning')}
      </span>
    </div>
  );
}
