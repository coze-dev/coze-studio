import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useShallow } from 'zustand/react/shallow';
import { I18n } from '@coze-arch/i18n';
import cls from 'classnames';

let timer = null;

export const BotStatistic: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { botId, spaceId } = useBotInfoStore(
    useShallow(s => ({
      description: s.description,
      botId: s.botId,
      botInfo: s,
      spaceId: s.space_id,
    })),
  );

  const tabOptions = [
    {
      label: I18n.t('analytics_page_title'),
      value: 'analysis',
    },
    {
      label: I18n.t('release_management_trace_mark'),
      value: 'log',
    },
  ];

  const tabPath = location.pathname.split(botId)[1];

  const switchRoute = (path: String) => {
    navigate(`/space/${spaceId}/bot/${botId}/statistic/${path}`, {
      replace: true,
    });
  };

  return (
    <div className="bg-white flex flex-col h-[calc(100%-56px)]">
      <div className="flex items-center gap-4 cursor-pointer pt-[24px] px-[24px]">
        {tabOptions.map(item => (
          <div
            key={item.value}
            className={cls('font-bold text-[14px]', {
              'coz-fg-plus': tabPath.includes(item.value),
            })}
            onClick={() => switchRoute(item.value)}
          >
            {item.label}
          </div>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-auto px-[24px]">
        <Outlet context={{ botId, spaceId }} />
      </div>
    </div>
  );
};

export default BotStatistic;
