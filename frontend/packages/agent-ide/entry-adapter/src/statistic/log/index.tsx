/* eslint-disable @coze-arch/max-line-per-function */
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Banner, Empty, Button } from '@coze-arch/bot-semi';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozCheckMarkCircleFill,
  IconCozWarningCircleFill,
} from '@coze-arch/coze-design/icons';
import { IconBotStatisticLog } from '@coze-arch/bot-icons';
import { Table } from '@coze-arch/coze-design';
import BotStatisticFilter, { getDateRangeByDays } from '../filter';
import { useSize } from 'ahooks';
import { request } from '../tools';
import { getBaseColumns } from './baseColumn';

const dateRangeDays = '1';
const defaultDateRange = getDateRangeByDays(Number(dateRangeDays));

let pageSize = document.documentElement.clientHeight / 72;
pageSize = Math.max(pageSize, 20);

export const BotStatisticLog: React.FC = () => {
  const { botId, spaceId } = useOutletContext();
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const pageNum = useRef(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const [dataMode, setDataMode] = useState('cov');
  const wrapRef = useRef(null);
  const size = useSize(wrapRef);

  const toggleDateMode = () => {
    reset();
    setDataMode(dataMode === 'cov' ? 'msg' : 'cov');
  };

  const onDateChange = range => {
    setDateRange(range);
  };

  const reset = () => {
    pageNum.current = 1;
    setSelectedRows([]);
    setDataSource([]);
    setLoading(false);
    setHasMore(true);
  };

  const getListData = useCallback(
    refresh => {
      if (refresh) {
        reset();
      }

      const url =
        dataMode === 'cov'
          ? '/api/statistics/app/list_app_conversation_log'
          : '/api/statistics/app/list_app_message_conlog';

      const params = {
        start_time: dateRange[0],
        end_time: dateRange[1],
        agent_id: botId,
        page: pageNum.current,
        page_size: pageSize,
      };

      setLoading(true);
      request(url, params)
        .then(({ data, pagination }) => {
          const originData = data.map(e => ({
            raw: e,
            createTime: e.CreateTime || e.create_time,
            messageId: e.run_id,
            conversationId: e.AppConversationID,
            title: e.ConversationName,
            messageCount: e.MessageCount,
            userName: e.user,
            costToken: e.tokens || 0,
            costTime: e.time_cost,
            message: e.message,
          }));
          let allCount = originData.length || 0;

          setDataSource(prev => {
            const list = [...prev, ...originData];
            allCount = list.length;
            return list;
          });

          const moreData =
            (pagination?.total || 0) > allCount + originData.length;

          if (moreData) {
            pageNum.current += 1;
          }

          setHasMore(moreData);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [botId, dataMode, dateRange],
  );

  const rowSelection = useMemo(
    () => ({
      width: 38,
      fixed: true,
      selectedRowKeys: selectedRows.map(r => r.messageId || r.conversationId),
      onChange: (_, rows) => setSelectedRows(rows ?? []),
    }),
    [selectedRows],
  );

  const exportSelectedRows = useCallback(() => {}, []);

  useEffect(() => {
    reset();
    getListData();
  }, [dataMode, dateRange, getListData]);

  return (
    <div className="flex flex-col h-full">
      <div>
        <Banner
          type="info"
          className="mt-[16px] py-[8px] rounded-[4px]"
          description={
            <div className="f-full flex gap-4 text-[13px]">
              <div className="flex-1">{I18n.t('bot_static_log_desc')}</div>
              <div className="coz-fg-plus cursor-pointer font-bold">
                {I18n.t('bot_static_log_view_download_record')}
              </div>
            </div>
          }
          closeIcon={null}
        />
        <BotStatisticFilter
          defaultDateRangeDays={dateRangeDays}
          onDateChange={onDateChange}
          onRefresh={() => getListData(true)}
          exchangeTooltip={
            dataMode === 'cov' ? '切换为对话视图' : '切换为会话视图'
          }
          onExchange={toggleDateMode}
        />
      </div>
      <div className="flex-1 min-h-0" ref={wrapRef}>
        <Table
          wrapperClassName="flex-1 min-h-0"
          tableProps={{
            rowSelection,
            sticky: true,
            loading,
            dataSource,
            columns: getBaseColumns(dataMode),
            pagination: false,
            scroll: { y: size?.height - 40 },
            rowKey: record => record?.messageId || record?.conversationId,
          }}
          empty={<Empty title={I18n.t('analytic_query_blank_context')} />}
          enableLoad
          loadMode="cursor"
          strictDataSourceProp
          hasMore={hasMore}
          onLoad={getListData}
        />
      </div>
      {dataSource.length > 0 ? (
        <div className="flex gap-[8px] py-[12px] items-center">
          <div className="text-[14px]">
            {I18n.t('table_view_002', {
              n: selectedRows.length,
            })}
          </div>
          <Button
            color="secondary"
            disabled={selectedRows.length === 0}
            icon={<IconBotStatisticLog />}
            onClick={exportSelectedRows}
          >
            {I18n.t('bot_statistic_log')}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default BotStatisticLog;
