import { useRequest } from 'ahooks';
import { TriggerEnabled } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';

export const useUpdateHomeTriggerConfig = ({
  botId,
  onSuccess,
}: {
  botId: string | undefined;
  onSuccess?: (isKeepReceiveTrigger: boolean) => void;
}) => {
  const { run, loading } = useRequest(
    async ({ isKeepReceiveTrigger }: { isKeepReceiveTrigger: boolean }) => {
      if (!botId) {
        throw new Error('try to request home trigger but no bot id');
      }
      await DeveloperApi.UpdateHomeTriggerUserConfig({
        bot_id: botId,
        action: isKeepReceiveTrigger
          ? TriggerEnabled.Open
          : TriggerEnabled.Close,
      });
      return isKeepReceiveTrigger;
    },
    {
      manual: true,
      onSuccess,
    },
  );
  return {
    keepReceiveHomeTrigger: () => run({ isKeepReceiveTrigger: true }),
    stopReceiveHomeTrigger: () => run({ isKeepReceiveTrigger: false }),
    loading,
  };
};
