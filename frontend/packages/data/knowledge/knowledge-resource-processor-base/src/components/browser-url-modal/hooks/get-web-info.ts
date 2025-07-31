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

import { useRequest } from 'ahooks';
import { KnowledgeApi } from '@coze-arch/bot-api';

import { type ViewOnlinePageDetailProps } from '@/types';

/**
 * Convert the web page information returned by the API into view data
 */
const transformWebInfoToViewData = (webInfo: {
  id?: string;
  url?: string;
  title?: string;
  content?: string;
}): ViewOnlinePageDetailProps => ({
  id: webInfo?.id,
  url: webInfo?.url,
  title: webInfo?.title,
  content: webInfo?.content,
});

export const useGetWebInfo = (): {
  data: ViewOnlinePageDetailProps[];
  loading: boolean;
  runAsync: (webID: string) => Promise<ViewOnlinePageDetailProps[]>;
  mutate: (data: ViewOnlinePageDetailProps[]) => void;
} => {
  const { data, mutate, loading, runAsync } = useRequest(
    async (webID: string) => {
      const { data: responseData } = await KnowledgeApi.GetWebInfo({
        web_ids: [webID],
        include_content: true,
      });

      // If there is no data, return an empty array
      if (!responseData?.[webID]?.web_info) {
        return [] as ViewOnlinePageDetailProps[];
      }

      const webInfo = responseData[webID].web_info;
      const mainPageData = transformWebInfoToViewData(webInfo);
      const result = [mainPageData];

      // Processing subpage data
      if (webInfo?.subpages?.length) {
        const subpagesData = webInfo.subpages.map(transformWebInfoToViewData);
        result.push(...subpagesData);
      }

      return result;
    },
  );

  return {
    data: data || [],
    loading,
    runAsync,
    mutate,
  };
};
