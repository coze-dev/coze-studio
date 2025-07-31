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

/* eslint-disable @typescript-eslint/no-magic-numbers */
import classNames from 'classnames';
import { useTimeoutConfig } from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';

export const Header = () => {
  const { min, max, disabled } = useTimeoutConfig();
  const minTimeout = min / 1000;
  const maxTimeout = max / 1000;
  const columns = [
    {
      title: I18n.t('workflow_250407_205', undefined, '超时时间'),
      tooltip: disabled ? (
        I18n.t('workflow_250508_01', undefined, '端插件不支持超时配置')
      ) : (
        <div>
          <p>{I18n.t('workflow_250421_04', undefined, '超时区间')}</p>
          <p>
            {minTimeout}s - {maxTimeout}s
          </p>
        </div>
      ),
    },
    {
      title: I18n.t('workflow_250407_206', undefined, '重试次数'),
    },
    {
      title: I18n.t('workflow_250407_207', undefined, '异常处理方式'),
    },
  ];
  return (
    <>
      {columns.map(item => (
        <div
          key={item.title}
          className={classNames(
            'coz-fg-secondary text-xs font-medium leading-4 flex items-center',
          )}
        >
          {item.title}
          {item.tooltip ? (
            <Tooltip content={item.tooltip}>
              <IconCozInfoCircle className="ml-1 text-sm" />
            </Tooltip>
          ) : null}
        </div>
      ))}
    </>
  );
};
