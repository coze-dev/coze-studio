import { useState } from 'react';
import { I18n } from '@coze-arch/i18n';
import { RadioGroup, DatePicker, Button, Tooltip } from '@coze-arch/bot-semi';
import { IconCozRefresh } from '@coze-arch/coze-design/icons';
import { IconBotAnalysisExchange } from '@coze-arch/bot-icons';
import dayjs from 'dayjs';

export const getDateRangeByDays = (days: number) => {
  const end = dayjs().endOf('day');
  const start = end.subtract(days, 'day').startOf('day');
  return [start.valueOf(), end.valueOf()];
};

export const BotStatisticFilter: React.FC = ({
  defaultDateRangeDays = '1',
  onDateChange,
  onRefresh,
  onExchange,
  exchangeTooltip,
}: {
  defaultDateRangeDays?: string;
  exchangeTooltip?: string;
  onDateChange: (dateRange: number[]) => void;
  onRefresh: () => void;
}) => {
  const [dateRange, setDateRange] = useState(defaultDateRangeDays);

  const disabledDate = (date?: Date) => {
    const today = dayjs().endOf('day');
    return dayjs(date).isAfter(today, 'day');
  };

  return (
    <div
      className="flex items-center justify-between py-[20px] sticky top-0 z-10"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center gap-4">
        <RadioGroup
          buttonSize="middle"
          options={[
            {
              label: I18n.t('release_analysis_time', { days: 1 }),
              value: '1',
            },
            {
              label: I18n.t('release_analysis_time', { days: 7 }),
              value: '7',
            },
            {
              label: I18n.t('release_analysis_time', { days: 15 }),
              value: '15',
            },
            {
              label: I18n.t('release_analysis_time', { days: 30 }),
              value: '30',
            },
            {
              label: I18n.t('release_analysis_time', { days: 60 }),
              value: '60',
            },
            {
              label: I18n.t('No_recall_004'),
              value: 'custom',
            },
          ]}
          value={dateRange}
          onChange={e => {
            const val = e.target.value;
            setDateRange(val);
            if (val !== 'custom') {
              const range = getDateRangeByDays(Number(val));
              onDateChange?.(range);
            }
          }}
          type="button"
        />
        {dateRange === 'custom' && (
          <DatePicker
            type="dateRange"
            density="compact"
            disabledDate={disabledDate}
            onChange={([start, end]) => {
              onDateChange?.([start.getTime(), end.getTime()]);
            }}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        {onExchange ? (
          <Tooltip content={exchangeTooltip} position="top">
            <Button
              color="secondary"
              icon={<IconBotAnalysisExchange />}
              onClick={onExchange}
            />
          </Tooltip>
        ) : null}
        <Tooltip content={I18n.t('pop_up_button_refresh')} position="top">
          <Button
            color="secondary"
            icon={<IconCozRefresh />}
            onClick={onRefresh}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default BotStatisticFilter;
