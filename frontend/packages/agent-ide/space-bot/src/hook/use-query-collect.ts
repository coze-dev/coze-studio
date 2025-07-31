/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
