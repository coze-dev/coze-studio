import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useShallow } from 'zustand/react/shallow';
import BotStatisticChartItem from './chartItem';

export const BotStatisticChartList: React.FC = (props: {
  updateTimestamp: number;
  dateRange: [number, number];
}) => {
  const { botId, spaceId } = useBotInfoStore(
    useShallow(s => ({
      description: s.description,
      botId: s.botId,
      botInfo: s,
      spaceId: s.space_id,
    })),
  );

  const chartListData = [
    {
      title: '全部消息数 (次)',
      description:
        '智能体在每个计算时间段的互动总次数，每回答用户一个问题算一次互动。仅针对对话型智能体。\n计算时间段根据所选时间确定，可能是每分钟、每小时、每两小时或每天。',
      api: '/api/statistics/app/messages',
      dataAdapter: list =>
        list?.map(e => ({
          date: e.date,
          value: e.count,
          category: '全部消息数',
        })),
    },
    {
      title: '互动用户数 (个)',
      description:
        '与智能体的有效互动，即有一问一答的唯一用户数。仅针对对话型智能体。',
      api: '/api/statistics/app/active-users',
      dataAdapter: list =>
        list?.map(e => ({
          date: e.date,
          value: e.count,
          category: '互动用户数',
        })),
    },
    {
      title: '平均会话互动数 (次/会话)',
      description:
        '每个会话用户的持续沟通次数，每一轮问答算为一次沟通，该指标反映了用户粘性。仅针对对话型智能体。',
      api: '/api/statistics/app/session-interactions',
      dataAdapter: list =>
        list?.map(e => ({
          date: e.date,
          value: e.count,
          category: '平均会话互动数',
        })),
    },
    {
      title: '全部 Token (tokens)',
      description:
        '通常 1 个中文词语、英文单词、数字、符号计为 1个 token，由于不同模型采用的分词器不同，同一段文本可能会分为不同的 tokens 数量。',
      api: '/api/statistics/app/tokens',
      dataAdapter: list => {
        const result: { date: string; value: number; category: string }[] = [];
        list?.forEach(e => {
          result.push(
            {
              date: e.date,
              value: e.input_tokens,
              category: '输入Token',
            },
            {
              date: e.date,
              value: e.output_tokens,
              category: '输出Token',
            },
            {
              date: e.date,
              value: e.total_tokens,
              category: '全部Token',
            },
          );
        });
        return result;
      },
    },
    {
      title: 'Token输出速度 (个/秒)',
      description:
        '衡量LLM(大语言模型)的性能。统计LLM从请求开始到输出完毕这期间的Tokens输出速度。',
      api: '/api/statistics/app/tokens-per-second',
      dataAdapter: list =>
        list?.map(e => ({
          date: e.date,
          value: e.count,
          category: 'Token输出速度',
        })),
    },
  ];
  return (
    <div
      className="w-full border-box pb-[32px]"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
      }}
    >
      {chartListData.map(item => (
        <BotStatisticChartItem
          key={item.title}
          {...item}
          {...props}
          botId={botId}
          spaceId={spaceId}
        />
      ))}
    </div>
  );
};

export default BotStatisticChartList;
