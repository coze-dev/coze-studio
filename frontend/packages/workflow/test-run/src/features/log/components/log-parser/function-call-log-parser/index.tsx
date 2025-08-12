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

import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';

import { LogWrap } from '../log-wrap';
import { type FunctionCallLog } from '../../../types';
import { FunctionCallLogPanel } from './function-call-panel';

import styles from './index.module.less';

export const FunctionCallLogParser: FC<{ log: FunctionCallLog }> = ({
  log,
}) => {
  const { items } = log;

  return (
    <LogWrap
      label={I18n.t('workflow_250310_06', undefined, '技能调用')}
      source={log.data}
      copyable={false}
    >
      {items.length ? (
        <div className={styles.container}>
          {items.map(item => (
            <>
              <FunctionCallLogPanel item={item} />
            </>
          ))}
        </div>
      ) : (
        <div className="border-[1px] border-solid coz-stroke-primary h-7 rounded-[6px]"></div>
      )}
    </LogWrap>
  );
};
