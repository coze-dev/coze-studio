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

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozPluginCitation,
  IconCozBot,
  IconCozClock,
  IconCozSuccessRate,
} from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';
import { formatNumber, formatPercent, formatTime } from '@coze-arch/bot-utils';

import s from './index.module.less';

export interface PluginPerfStaticsProps {
  avgExecTime?: number;
  callAmount?: number;
  successRate?: number;
  botsUseCount?: number;
  className?: string;
}

export const PluginPerfStatics = (props: PluginPerfStaticsProps) => {
  const { avgExecTime, callAmount, successRate, botsUseCount, className } =
    props;

  if (IS_OPEN_SOURCE) {
    return null;
  }

  if (
    [avgExecTime, callAmount, successRate, botsUseCount].every(
      r => r === undefined,
    )
  ) {
    return null;
  }

  return (
    <div className={cls(className, s['plugin-perf-statics'])}>
      <Tooltip content={I18n.t('plugin_metric_usage_count')}>
        <div className={s['statics-metrics']}>
          <IconCozPluginCitation />
          {formatNumber(callAmount || 0)}
        </div>
      </Tooltip>
      <Tooltip content={I18n.t('plugin_metric_bots_using')}>
        <div className={s['statics-metrics']}>
          <IconCozBot />
          {formatNumber(botsUseCount || 0)}
        </div>
      </Tooltip>
      <Tooltip content={I18n.t('plugin_metric_average_time')}>
        <div className={s['statics-metrics']}>
          <IconCozClock />
          {formatTime(avgExecTime || 0)}
        </div>
      </Tooltip>
      <Tooltip content={I18n.t('plugin_metric_success_rate')}>
        <div className={s['statics-metrics']}>
          <IconCozSuccessRate />
          {formatPercent(successRate)}
        </div>
      </Tooltip>
    </div>
  );
};
