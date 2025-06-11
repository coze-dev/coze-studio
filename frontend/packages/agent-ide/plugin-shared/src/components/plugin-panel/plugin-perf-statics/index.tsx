import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozPluginCitation,
  IconCozBot,
  IconCozClock,
  IconCozSuccessRate,
} from '@coze/coze-design/icons';
import { Tooltip } from '@coze/coze-design';
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
