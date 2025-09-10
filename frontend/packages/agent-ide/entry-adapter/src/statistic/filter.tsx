import { useState } from 'react';
import { I18n } from '@coze-arch/i18n';
import { RadioGroup, DatePicker, Button } from '@coze-arch/bot-semi';
import { IconCozRefresh } from '@coze-arch/coze-design/icons';
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
}: {
  defaultDateRangeDays?: string;
  onDateChange: (dateRange: number[]) => void;
  onRefresh: () => void;
}) => {
  const [dateRange, setDateRange] = useState(defaultDateRangeDays);

  const disabledDate = (date?: Date) => {
    const today = dayjs().endOf('day');
    return dayjs(date).isAfter(today, 'day');
  };

  return (
    <div className="flex items-center justify-between pt-[24px] pb-[20px]">
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
            style={{ width: 260 }}
            disabledDate={disabledDate}
            onChange={([start, end]) => {
              onDateChange?.([start.getTime(), end.getTime()]);
            }}
          />
        )}
      </div>
      <Button color="secondary" icon={<IconCozRefresh />} onClick={onRefresh}>
        {/* {I18n.t('db_optimize_012')} */}
      </Button>
    </div>
  );
};

export default BotStatisticFilter;
