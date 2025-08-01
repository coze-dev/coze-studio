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

import { useState, type FC } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozArrowDown, IconCozArrowUp } from '@coze-arch/coze-design/icons';

import { DataViewer } from '../../data-viewer';
import { type FunctionCallLogItem } from '../../../types';
import { ContentHeader } from './content-header';

import styles from './function-call-panel.module.less';

export const FunctionCallLogPanel: FC<{ item: FunctionCallLogItem }> = ({
  item,
}) => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className={styles.item}>
      <div
        className={classNames(
          'flex items-center justify-between px-[5px] h-7',
          styles.header,
          {
            [styles['header-expanded']]: !collapsed,
          },
        )}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center">
          <img src={item.icon} className={styles.icon} />
          <span className="text-xs leading-4 font-medium coz-fg-primary ml-2">
            {item.name}
          </span>
        </div>
        {collapsed ? (
          <IconCozArrowDown className="text-sm coz-fg-secondary"></IconCozArrowDown>
        ) : (
          <IconCozArrowUp className="text-sm coz-fg-secondary"></IconCozArrowUp>
        )}
      </div>
      {!collapsed ? (
        <div className={classNames('p-[6px]', styles.content)}>
          {item.inputs ? (
            <>
              <ContentHeader source={item.inputs}>
                {I18n.t('workflow_250310_11', undefined, '输入')}
              </ContentHeader>
              <DataViewer
                data={item.inputs}
                className={styles['json-viewer']}
              />
            </>
          ) : null}

          <ContentHeader source={item.outputs} className="mt-1.5">
            {I18n.t('workflow_250310_12', undefined, '输出')}
          </ContentHeader>
          <DataViewer data={item.outputs} className={styles['json-viewer']} />
        </div>
      ) : null}
    </div>
  );
};
