import { useState } from 'react';

import { useRequest } from 'ahooks';
import {
  type GenerateUserQueryCollectPolicyRequest,
  type GetUserQueryCollectOptionData,
} from '@coze-arch/bot-api/playground_api';
import { PlaygroundApi } from '@coze-arch/bot-api';

export const useGenerateLink = () => {
  const [link, setLink] = useState('');
  const { loading, run: runGenerate } = useRequest(
    (info: GenerateUserQueryCollectPolicyRequest) =>
      PlaygroundApi.GenerateUserQueryCollectPolicy(info),
    {
      manual: true,
      onSuccess: dataSourceData => {
        setLink(dataSourceData.data.policy_link);
      },
    },
  );
  return {
    runGenerate,
    loading,
    link,
  };
};

export const useGetUserQueryCollectOption = () => {
  const [queryCollectOption, setQueryCollectOption] =
    useState<GetUserQueryCollectOptionData>();
  const [supportText, setSupportText] = useState('');
  useRequest(() => PlaygroundApi.GetUserQueryCollectOption(), {
    onSuccess: dataSourceData => {
      setQueryCollectOption(dataSourceData.data);
      setSupportText(
        dataSourceData.data?.support_connectors
          ?.map(item => item.name)
          .join('、'),
      );
    },
  });
  return {
    queryCollectOption,
    supportText,
  };
};
