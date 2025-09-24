/* eslint-disable @coze-arch/max-line-per-function */
import { type FC, useState, useRef, useCallback, useEffect } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Empty, Banner, Tooltip, Notification } from '@coze-arch/bot-semi';
import { Typography, SideSheet, Table } from '@coze-arch/coze-design';
import { request, getRowsCount } from '../tools';
import {
  IconCozCheckMarkCircleFill,
  IconCozWarningCircleFill,
} from '@coze-arch/coze-design/icons';
import { IconBotAnalysisDownload } from '@coze-arch/bot-icons';
import cls from 'classnames';
import styles from './index.module.less';

interface ExportDrawerProps {
  spaceId?: string;
  botId: string;
  visible: boolean;
  onClose?: () => void;
}

export const ExportDrawer: FC<ExportDrawerProps> = ({
  botId,
  visible,
  onClose,
}) => {
  const pageNum = useRef(1);
  const [hasMore, setHasMore] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);

  const getListData = useCallback(() => {
    const query = {
      agent_id: botId,
      page: pageNum.current,
      page_size: getRowsCount(60),
    };

    setLoading(true);
    request('/api/statistics/app/list_export_conversation_files', query)
      .then(({ data, pagination }) => {
        setDataSource(prev => [...prev, ...data]);

        const moreData = pagination?.total_pages > pageNum.current;

        if (moreData) {
          pageNum.current += 1;
        }

        setHasMore(moreData);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [botId]);

  const downloadFile = useCallback(
    record => {
      request('/api/statistics/app/get_export_conversation_file_download_url', {
        agent_id: botId,
        export_task_id: record.export_task_id,
      })
        .then(data => {
          window.open(data.file_url);
        })
        .catch(err => {
          Notification.error({
            title: I18n.t('bot_ide_knowledge_confirm_title'),
            content: I18n.t('bot_ide_knowledge_export_failed'),
          });
        });
    },
    [botId],
  );

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
      width={480}
      headerStyle={{
        padding: '12px 24px',
        alignItems: 'center',
        display: 'flex',
        borderBottom: '1px solid rgb(229, 230, 235)',
      }}
      bodyStyle={{ padding: '0' }}
      mask={false}
      title={
        <Typography.Text ellipsis={{ showTooltip: true }}>
          <span className="text-[16px] font-[500] text-[#0c0d0e]">
            {I18n.t('bot_ide_knowledge_export_task_title')}
          </span>
        </Typography.Text>
      }
    >
      <div
        className={cls(styles.exportTable, 'flex-1 min-h-0 overflow-hidden')}
      >
        <Banner
          type="info"
          className="py-[8px]"
          description={
            <div className="f-full flex gap-4 text-[13px]">
              {I18n.t('bot_ide_knowledge_export_success_tip')}
            </div>
          }
          closeIcon={null}
        />
        <Table
          wrapperClassName="flex-1 min-h-0"
          tableProps={{
            showHeader: false,
            loading,
            dataSource,
            bordered: false,
            columns: [
              {
                dataIndex: 'item',
                render: (_text, record) => (
                  <div className="pl-[14px]">
                    <Typography.Text ellipsis={{ showTooltip: true }}>
                      <span className="font-bold text-gray-600 text-[12px]">
                        {record.file_name}
                      </span>
                    </Typography.Text>
                    <div className="flex gap-[8px]">
                      <div className="max-w-[180px]">
                        <Typography.Text ellipsis={{ showTooltip: true }}>
                          <span className="text-[12px] text-gray-400">
                            任务ID {record.export_task_id}
                          </span>
                        </Typography.Text>
                      </div>
                      <div className="text-[12px] text-gray-400">
                        {record.created_at}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                dataIndex: 'download',
                width: 36,
                render: (_text, record) =>
                  record.status === 1 ? (
                    <Tooltip
                      content={I18n.t(
                        'analytics_query_aigc_infopanel_download',
                      )}
                      position="top"
                    >
                      <div
                        className="text-[18px] text-gray-600"
                        onClick={() => downloadFile(record)}
                      >
                        <IconBotAnalysisDownload />
                      </div>
                    </Tooltip>
                  ) : null,
              },
              {
                dataIndex: 'status',
                width: 54,
                align: 'center',
                render: (_text, record) =>
                  record.status === 1 ? (
                    <IconCozCheckMarkCircleFill className="text-[16px] text-[#00C06B]" />
                  ) : (
                    <IconCozWarningCircleFill className="text-[16px] text-[#FF4D4F]" />
                  ),
              },
            ],
            pagination: false,
            scroll: { y: document.documentElement.clientHeight - 50 - 38 },
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
