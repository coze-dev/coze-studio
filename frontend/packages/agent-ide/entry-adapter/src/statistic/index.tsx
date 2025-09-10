import { useState } from 'react';
import BotStatisticFilter, { getDateRangeByDays } from './filter';
import BotStatisticChartList from './chartList';

const dateRangeDays = '1';
const defaultDateRange = getDateRangeByDays(Number(dateRangeDays));

export const BotStatistic: React.FC = () => {
  const [dateRange, setDateRange] = useState(defaultDateRange);

  return (
    <div className="flex-1 bg-white overflow-auto px-[24px]">
      <BotStatisticFilter
        defaultDateRangeDays={dateRangeDays}
        onDateChange={setDateRange}
        onRefresh={() => console.log('refresh', dateRange)}
      />
      <BotStatisticChartList />
    </div>
  );
};

export default BotStatistic;
