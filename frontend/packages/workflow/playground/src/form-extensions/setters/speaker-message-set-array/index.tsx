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
          // 如果没有 biz_role_id ，说明是nickname variable，不做校验
          if (!val?.biz_role_id) {
            return true;
          }
          const existRole = res.role_list.find(
            role => role.biz_role_id === val?.biz_role_id,
          );

          // 如果没找到对应的角色，说明已经被删除，角色已失效
          if (!existRole) {
            return false;
          }

          // 如果没有nickname，说明原角色变成了空位角色，这里提示已失效
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
