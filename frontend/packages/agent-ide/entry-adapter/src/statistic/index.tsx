import { useState } from 'react';
import BotStatisticFilter, { getDateRangeByDays } from './filter';
import BotStatisticChartList from './chartList';

const dateRangeDays = '1';
const defaultDateRange = getDateRangeByDays(Number(dateRangeDays));

export const BotStatistic: React.FC = () => {
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [updateTimestamp, setUpdateTimestamp] = useState(Date.now());

  return (
    <div className="flex-1 bg-white overflow-auto px-[24px]">
      <BotStatisticFilter
        defaultDateRangeDays={dateRangeDays}
        onDateChange={setDateRange}
        onRefresh={() => setUpdateTimestamp(Date.now())}
      />
      <BotStatisticChartList
        updateTimestamp={updateTimestamp}
        dateRange={dateRange}
      />
    </div>
  );
};

export default BotStatistic;
