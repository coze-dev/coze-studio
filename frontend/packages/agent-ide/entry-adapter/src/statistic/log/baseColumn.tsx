import { Typography } from '@coze-arch/bot-semi';

export const getBaseColumns = (dataMode: String) => {
  const cov = [
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
  ];

  const msg = [
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
  ];

  return dataMode === 'cov' ? cov : msg;
};
