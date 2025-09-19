import { useState } from 'react';
import BotStatisticFilter, { getDateRangeByDays } from '../filter';
import BotStatisticChartList from './chartList';

const dateRangeDays = '1';
const defaultDateRange = getDateRangeByDays(Number(dateRangeDays));

export const BotStatisticAnalysis: React.FC = () => {
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [updateTimestamp, setUpdateTimestamp] = useState(Date.now());

  return (
    <>
      <BotStatisticFilter
        defaultDateRangeDays={dateRangeDays}
        onDateChange={setDateRange}
        onRefresh={() => setUpdateTimestamp(Date.now())}
      />
      <BotStatisticChartList
        updateTimestamp={updateTimestamp}
        dateRange={dateRange}
      />
    </>
  );
};

export default BotStatisticAnalysis;
