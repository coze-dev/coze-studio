/* eslint-disable @coze-arch/max-line-per-function */
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Banner, Empty, Button, Notification } from '@coze-arch/bot-semi';
import { I18n } from '@coze-arch/i18n';
import { IconBotStatisticLog } from '@coze-arch/bot-icons';
import { Table } from '@coze-arch/coze-design';
import BotStatisticFilter, { getDateRangeByDays } from '../filter';
import { useSize } from 'ahooks';
import { request, getRowsCount } from '../tools';
import { getBaseColumns } from './baseColumn';
import { MessageDrawer } from './mesageDrawer';
import { ExportDrawer } from './exportDrawer';

const dateRangeDays = '1';
const defaultDateRange = getDateRangeByDays(Number(dateRangeDays));

export const BotStatisticLog: React.FC = () => {
  const { botId, spaceId, botInfo } = useOutletContext();
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const pageNum = useRef(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentItem, setCurrentItem] = useState();
  const [messageDrawerVisible, setMessageDrawerVisible] = useState(false);
  const [exportDrawerVisible, setExportDrawerVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [dataMode, setDataMode] = useState('cov');
  const wrapRef = useRef(null);
  const size = useSize(wrapRef);

  const toggleDateMode = () => {
    // 将所有状态更新都放在setTimeout中，确保在当前渲染周期完成后再执行
    setTimeout(() => {
      reset();
      setDataMode(dataMode === 'cov' ? 'msg' : 'cov');
    }, 0);
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
        page_size: getRowsCount(72),
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

  const exportSelectedRows = useCallback(() => {
    const params = {
      agent_id: botId,
      file_name: `对话记录_${botInfo?.name}_${dataMode}_${Date.now()}.xlsx`,
    };

    if (dataMode === 'cov') {
      params.conversation_ids = selectedRows.map(r => r.conversationId);
    } else {
      params.run_id = selectedRows.map(r => r.messageId);
    }

    setExportLoading(true);
    request('/api/statistics/app/export_conversation_message_log', params)
      .then(res => {
        Notification.success({
          title: I18n.t('bot_ide_knowledge_confirm_title'),
          content: I18n.t('bot_static_log_export_success'),
        });
        setSelectedRows([]);
      })
      .catch(err => {
        Notification.error({
          title: I18n.t('bot_ide_knowledge_confirm_title'),
          content: I18n.t('bot_static_log_export_failed'),
        });
      })
      .finally(() => {
        setExportLoading(false);
      });
  }, [botId, botInfo, dataMode, selectedRows]);

  const onItemClick = (record, index) => {
    if (dataMode === 'cov') {
      // 使用setTimeout确保异步更新状态，避免在渲染周期内触发新的状态更新
      setTimeout(() => {
        setCurrentItem(record);
        setMessageDrawerVisible(true);
      }, 0);
    }
  };

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
              <div
                className="coz-fg-plus cursor-pointer font-bold"
                onClick={() => setExportDrawerVisible(true)}
              >
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
            columns: getBaseColumns(dataMode, onItemClick),
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
            loading={exportLoading}
            disabled={selectedRows.length === 0}
            icon={<IconBotStatisticLog />}
            onClick={exportSelectedRows}
          >
            {I18n.t('bot_statistic_log')}
          </Button>
        </div>
      ) : null}
      <MessageDrawer
        spaceId={spaceId}
        botId={botId}
        params={currentItem}
        visible={messageDrawerVisible}
        onClose={() => setMessageDrawerVisible(false)}
      />
      <ExportDrawer
        spaceId={spaceId}
        botId={botId}
        visible={exportDrawerVisible}
        onClose={() => setExportDrawerVisible(false)}
      />
    </div>
  );
};

export default BotStatisticLog;
