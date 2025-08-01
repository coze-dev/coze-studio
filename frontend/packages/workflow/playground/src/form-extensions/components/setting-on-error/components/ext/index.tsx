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

import { isNumber } from 'lodash-es';
import classNames from 'classnames';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import {
  SETTING_ON_ERROR_NODES_CONFIG,
  type SettingOnErrorExt,
} from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';

import { type IModelValue } from '@/typing';
import { ModelSelect } from '@/components/model-select';

import { type SettingOnErrorItemProps } from '../../types';
import { Trigger } from './trigger';

import styles from './index.module.less';

type Props = SettingOnErrorItemProps<SettingOnErrorExt> & {
  retryTimes?: number;
};

/**
 * Other configurations
 */
export const Ext: FC<Props> = ({
  value,
  onChange,
  retryTimes,
  readonly,
}: Props) => {
  const node = useCurrentEntity();
  const enableBackupModel =
    SETTING_ON_ERROR_NODES_CONFIG[node?.flowNodeType]?.enableBackupModel;

  if (!enableBackupModel || !retryTimes || !isNumber(retryTimes)) {
    return null;
  }

  const showClear = !!(!readonly && value?.backupLLmParam?.modelType);

  const handleModelChange = v => {
    const ext: SettingOnErrorExt = {
      ...(value || {}),
      backupLLmParam: v as IModelValue,
    };
    onChange?.(ext);
  };

  return (
    <div className="flex items-center">
      <div className="w-[92px] text-xs font-medium coz-fg-primary flex items-center">
        {I18n.t('workflow_250407_203', undefined, '备选模型')}
        <Tooltip
          content={I18n.t(
            'workflow_250407_204',
            undefined,
            '重试时会使用备选模型',
          )}
        >
          <IconCozInfoCircle className="text-sm coz-fg-secondary ml-1.5" />
        </Tooltip>
      </div>
      <div className="flex-1">
        <ModelSelect
          name="backupLLmParam"
          className={classNames(styles['model-select'], {
            [styles['model-select-clearable']]: showClear,
          })}
          testName="setting-on-error.ext.backupLLmParam"
          value={
            value?.backupLLmParam
              ? (value.backupLLmParam as IModelValue)
              : undefined
          }
          onChange={handleModelChange}
          readonly={!!readonly}
          popoverPosition="top"
          popoverAutoAdjustOverflow={true}
          triggerRender={(model, popoverVisible) => (
            <Trigger
              model={model}
              popoverVisible={popoverVisible}
              placeholder={I18n.t(
                'workflow_250416_04',
                undefined,
                '选择备选模型',
              )}
              showClear={showClear}
              onClear={() => {
                handleModelChange(undefined);
              }}
            />
          )}
        />
      </div>
    </div>
  );
};
