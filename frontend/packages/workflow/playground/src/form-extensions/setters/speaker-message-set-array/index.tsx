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

import { z } from 'zod';
import { workflowQueryClient } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';
import { SocialApi } from '@coze-arch/bot-api';

import { SpeakerMessageSetArray } from './speaker-message-set-array';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const speakerMessageSetArray: any = {
  key: 'SpeakerMessageSetArray',
  component: SpeakerMessageSetArray,
  validator: async ({ value, context }) => {
    const { playgroundContext } = context;
    const { globalState } = playgroundContext;

    const res = await workflowQueryClient.fetchQuery({
      queryKey: ['scene_flow_role_list'],
      staleTime: Infinity,
      queryFn: () =>
        SocialApi.GetMetaRoleList({
          meta_id: globalState.bindBizID as string,
        }),
    });

    const speakerMessageSetSchema = z
      .object({
        biz_role_id: z.string(),
        role: z.string(),
        nickname: z.string(),
        generate_mode: z.number(),
        content: z.string().optional(),
      })
      .nullish()
      .refine(
        val => {
          if (!val) {
            return false;
          } else {
            return true;
          }
        },
        {
          message: I18n.t(
            'scene_workflow_chat_message_error_content_empty',
            {},
            '对话内容不可为空',
          ),
        },
      )
      .refine(
        val => {
          // If there is no biz_role_id, it means it is a nickname variable, no verification is done
          if (!val?.biz_role_id) {
            return true;
          }
          const existRole = res.role_list.find(
            role => role.biz_role_id === val?.biz_role_id,
          );

          // If the corresponding role is not found, it means that it has been deleted and the role has expired
          if (!existRole) {
            return false;
          }

          // If there is no nickname, it means that the original character has become an empty character, and the prompt here has expired
          if (val?.nickname && !existRole.nickname) {
            return false;
          }

          return true;
        },
        {
          message: I18n.t('scene_workflow_invalid', {}, '已失效'),
        },
      );

    if (!value?.length) {
      return true;
    }

    const parseResult = value.map((item, index) => {
      const itemParseResult = speakerMessageSetSchema.safeParse(item);

      if (!itemParseResult.success) {
        return {
          success: itemParseResult.success,
          ...JSON.parse(itemParseResult.error.message)?.[0],
          path: [index],
        };
      } else {
        return {
          success: itemParseResult.success,
        };
      }
    });
    if (parseResult.every(item => item.success)) {
      return true;
    } else {
      return JSON.stringify({
        name: 'ZodError',
        issues: parseResult.reduce((buf, item) => {
          if (!item.success) {
            buf.push(item);
          }
          return buf;
        }, []),
        errors: parseResult,
      });
    }
  },
};
