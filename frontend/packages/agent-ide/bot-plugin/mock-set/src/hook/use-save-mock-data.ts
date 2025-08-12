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
import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import {
  EVENT_NAMES,
  type PluginMockSetCommonParams,
  sendTeaEvent,
} from '@coze-arch/bot-tea';
import { Toast } from '@coze-arch/bot-semi';
import {
  type MockRule,
  ResponseExpectType,
  type BizCtx,
} from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';
enum ResType {
  SUCCESS = 'success',
  FAIL = 'fail',
}

interface SuccessResType extends MockRule {
  status: ResType;
}

interface FailResType {
  status: ResType;
  error: Error;
}

export function useSaveMockData({
  mockSetId,
  basicParams,
  bizCtx,
  onSuccess,
  onError,
}: {
  mockSetId?: string;
  basicParams: PluginMockSetCommonParams;
  bizCtx: BizCtx;
  onSuccess?: (rules: MockRule[]) => void;
  onError?: () => void;
}) {
  const { runAsync: save, loading } = useRequest(
    async (values: string[], mockDataId?: string) => {
      const promises: Promise<SuccessResType | FailResType>[] = values.map(
        async v => {
          const rule = {
            id: mockDataId,
            mocksetID: mockSetId,
            responseExpect: {
              responseExpectType: ResponseExpectType.JSON,
              responseExpectRule: v,
            },
          };

          try {
            const { id } = await debuggerApi.SaveMockRule(
              {
                bizCtx,
                ...rule,
              },
              { __disableErrorToast: true },
            );

            return {
              status: ResType.SUCCESS,
              ...rule,
              id: id || mockDataId,
            };
          } catch (error) {
            // @ts-expect-error -- linter-disable-autofix
            logger.error({ error, eventName: 'save_mock_info_fail' });

            return {
              status: ResType.FAIL,
              error,
            };
          }
        },
      );

      const res = await Promise.all(promises);

      const successRes = res.filter(
        item => item.status === 'success',
      ) as SuccessResType[];
      const failRes = res.filter(
        item => item.status !== 'success',
      ) as FailResType[];

      if (successRes.length) {
        sendTeaEvent(EVENT_NAMES.create_mock_front, {
          ...basicParams,
          mock_counts: successRes.length,
          status: 0,
        });
      }

      if (failRes.length) {
        sendTeaEvent(EVENT_NAMES.create_mock_front, {
          ...basicParams,
          mock_counts: failRes.length,
          status: 1,
          error: failRes[0].error?.message,
        });
      }

      if (successRes.length === 0) {
        // Only if all fail, it is considered a failure, and a toast prompt is required at this time.
        Toast.error({
          content: withSlardarIdButton(
            failRes[0]?.error?.message || I18n.t('error'),
          ),
          showClose: false,
        });
        onError?.();
      } else {
        onSuccess?.(successRes);
      }
    },
    {
      manual: true,
    },
  );

  return { save, loading };
}
