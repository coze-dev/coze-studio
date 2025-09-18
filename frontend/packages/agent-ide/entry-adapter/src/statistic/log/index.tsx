/* eslint-disable @coze-arch/max-line-per-function */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Banner, Empty, Spin, Typography } from '@coze-arch/bot-semi';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozCheckMarkCircleFill,
  IconCozWarningCircleFill,
} from '@coze-arch/coze-design/icons';
import { Table } from '@coze-arch/coze-design';
import BotStatisticFilter, { getDateRangeByDays } from '../filter';
import { useSize } from 'ahooks';
import { request } from '../tools';

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

  const [dataMode, setDataMode] = useState('cov');
  const wrapRef = useRef(null);
  const size = useSize(wrapRef);

  const toggleDateMode = () => {
    reset();
    setDataMode(dataMode === 'cov' ? 'msg' : 'cov');
  };

  const onDateChange = range => {
    reset();
    setDateRange(range);
  };

  const reset = () => {
    pageNum.current = 1;
    setDataSource([]);
    setLoading(false);
    setHasMore(true);
  };

  const getListData = useCallback(
    refresh => {
      if (refresh) {
        reset();
      }

      if (!hasMore) {
        return;
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

  useEffect(() => {
    reset();
    getListData();
  }, [getListData, dataMode, dateRange]);

  const columns = {
    cov: [
      {
        title: '时间',
        dataIndex: 'createTime',
        render: (_text, record) => (
          <div>
            <div className="font-bold text-gray-600 text-[14px]">
              {record.createTime}
            </div>
            <div className="text-gray-400">{record.conversationId}</div>
          </div>
        ),
      },
      {
        title: '标题',
        dataIndex: 'title',
      },
      {
        title: '消息数',
        dataIndex: 'messageCount',
      },
      {
        title: '创建用户',
        dataIndex: 'userName',
      },
    ],
    msg: [
      {
        title: '时间',
        dataIndex: 'createTime',
        width: 240,
        render: (_text, record) => (
          <div>
            <div className="font-bold text-gray-600 text-[14px]">
              {record.createTime}
            </div>
            <div className="text-gray-400">{record.messageId}</div>
          </div>
        ),
      },
      {
        title: '会话标题',
        dataIndex: 'title',
      },
      {
        title: '问答',
        dataIndex: 'message',
        render: (_text, record) => (
          <>
            <div className="max-w-[320px]">
              <Typography.Text
                className="text-[12px]"
                ellipsis={{ showTooltip: true }}
              >
                问题：{record.message?.query || '-'}
              </Typography.Text>
            </div>
            <div className="max-w-[320px]">
              <Typography.Text
                className="text-[12px]"
                ellipsis={{ showTooltip: true }}
              >
                回答：{record.message?.answer || '-'}
              </Typography.Text>
            </div>
          </>
        ),
      },
      {
        title: '创建用户',
        dataIndex: 'userName',
      },
      {
        title: 'Tokens消耗',
        dataIndex: 'costToken',
      },
      {
        title: '耗时',
        dataIndex: 'costTime',
        render: (_text, record) =>
          record.costTime ? `${record.costTime}s` : '-',
      },
    ],
  };

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
            sticky: true,
            loading,
            dataSource,
            columns: columns[dataMode],
            pagination: false,
            scroll: { y: size?.height - 40 },
          }}
          empty={<Empty title={I18n.t('analytic_query_blank_context')} />}
          enableLoad
          loadMode="cursor"
          strictDataSourceProp
          hasMore={hasMore}
          onLoad={getListData}
        />
      </div>
    </div>
  );
};

export default BotStatisticLog;
