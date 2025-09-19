/* eslint-disable @coze-arch/max-line-per-function */
import { type FC, useState, useRef, useCallback, useEffect } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Empty } from '@coze-arch/bot-semi';
import { Typography, SideSheet, Divider, Table } from '@coze-arch/coze-design';
import { request, getRowsCount } from '../tools';
import { getBaseColumns } from './baseColumn';

interface MessageDrawerProps {
  spaceId?: string;
  botId: string;
  visible: boolean;
  params?: Record<string, string>;
  onClose?: () => void;
}

export const MessageDrawer: FC<MessageDrawerProps> = ({
  botId,
  params,
  visible,
  onClose,
}) => {
  const pageNum = useRef(1);
  const [hasMore, setHasMore] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [statistic, setStatistic] = useState({
    message_count: 0,
    tokens_p50: 0,
    latency_p50: 0,
    latency_p99: 0,
  });
  const [loading, setLoading] = useState(false);

  const getListData = useCallback(() => {
    const query = {
      agent_id: botId,
      conversation_id: params?.conversationId,
      page: pageNum.current,
      page_size: getRowsCount(72),
    };

    setLoading(true);
    request('/api/statistics/app/list_conversation_message_log', query)
      .then(({ statistics, data, pagination }) => {
        if (statistics) {
          setStatistic(statistics);
        }
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

        setDataSource(prev => [...prev, ...originData]);

        const moreData = pagination?.total_pages > pageNum.current;

        if (moreData) {
          pageNum.current += 1;
        }

        setHasMore(moreData);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [botId, params]);

  useEffect(() => {
    if (visible) {
      getListData();
    } else {
      pageNum.current = 1;
      setHasMore(true);
      setDataSource([]);
    }
  }, [getListData, visible]);

  return (
    <SideSheet
      visible={visible}
      onCancel={onClose}
      placement="right"
      width={1000}
      headerStyle={{
        padding: '12px 24px',
        alignItems: 'center',
        display: 'flex',
        borderBottom: '1px solid rgb(229, 230, 235)',
      }}
      bodyStyle={{ padding: '0 24px' }}
      mask={true}
      title={
        <div className="flex justify-between items-center">
          <div className="max-w-[200px]">
            <Typography.Text ellipsis={{ showTooltip: true }}>
              <span className="text-[16px] font-[500] text-[#0c0d0e]">
                {params?.title}
              </span>
            </Typography.Text>
            <div className="text-[12px] text-[#737a87] font-[400]">
              {params?.createTime}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[16px] font-[500] text-[#0c0d0e]">
              {statistic?.message_count}
            </div>
            <div className="text-[12px] text-[#737a87] font-[400]">
              {I18n.t('analytic_query_summary_queriescount')}
            </div>
          </div>
          <Divider layout="vertical" margin="12px" />
          <div className="text-center">
            <div className="text-[16px] font-[500] text-[#0c0d0e]">
              {statistic?.tokens_p50}
            </div>
            <div className="text-[12px] text-[#737a87] font-[400]">
              {I18n.t('analytic_query_summary_tokens_median')}
            </div>
          </div>
          <Divider layout="vertical" margin="12px" />
          <div className="text-center">
            <div className="flex items-center gap-[8px] text-[16px] font-[500] text-[#0c0d0e]">
              <div className="flex items-center gap-[4px]">
                <span>{statistic?.latency_p50}s</span>
                <span className="text-[12px] leading-none text-[#0c0d0e] p-[4px] rounded-[4px] bg-[#f2f4f7]">
                  P50
                </span>
              </div>
              <div className="flex items-center gap-[4px]">
                <span>{statistic?.latency_p99}s</span>
                <span className="text-[12px] leading-none text-[#0c0d0e] p-[4px] rounded-[4px] bg-[#f2f4f7]">
                  P99
                </span>
              </div>
            </div>
            <div className="text-[12px] text-[#737a87] font-[400]">
              {I18n.t('analytic_query_detail_key_latency')}
            </div>
          </div>
          <Divider layout="vertical" margin="12px" />
        </div>
      }
    >
      <div className="flex-1 min-h-0 pt-[12px] overflow-hidden">
        <Table
          wrapperClassName="flex-1 min-h-0"
          tableProps={{
            sticky: true,
            loading,
            dataSource,
            columns: getBaseColumns('msg', undefined, ['title', 'userName']),
            pagination: false,
            scroll: { y: document.documentElement.clientHeight - 85 - 40 },
          }}
          empty={<Empty title={I18n.t('analytic_query_blank_context')} />}
          enableLoad
          loadMode="cursor"
          strictDataSourceProp
          hasMore={hasMore}
          onLoad={getListData}
        />
      </div>
    </SideSheet>
  );
};
