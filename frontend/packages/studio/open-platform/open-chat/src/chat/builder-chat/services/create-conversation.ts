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

import i18n from '@coze-arch/i18n/intl';
import { type CozeAPI } from '@coze/api';

import { type IBuilderChatProps } from '../type';
import { getConnectorId } from '../helper/get-connector-id';
export const createOrGetConversation = async (
  apiSdk: CozeAPI | undefined,
  props: IBuilderChatProps,
) => {
  let conversationId = '';
  let sectionId = '';

  try {
    if (props?.project?.type === 'bot') {
      const res = await apiSdk?.conversations.create(
        {
          // @ts-expect-error -- linter-disable-autofix
          connector_id: getConnectorId(props),
        },
        {
          headers: {
            'Accept-Language': i18n.language === 'zh-CN' ? 'zh' : 'en',
          },
        },
      );
      conversationId = res?.id || '';
      // @ts-expect-error -- linter-disable-autofix
      sectionId = res.last_section_id;
    } else {
      if (IS_OPEN_SOURCE) {
        const res = (await apiSdk?.post(
          '/v1/workflow/conversation/create',
          {
            app_id: props.project?.id,
            conversation_name: props?.project?.conversationName,
            get_or_create: true,
            draft_mode: props?.project?.mode === 'draft',
            workflow_id: props?.workflow?.id,
            connector_id: getConnectorId(props),
          },
          false,
          {
            headers: {
              'Accept-Language': i18n.language === 'zh-CN' ? 'zh' : 'en',
            },
          },
        )) as {
          data: {
            id: string;
            last_section_id: string;
          };
        };
        conversationId = res?.data?.id || '';
        sectionId = res?.data?.last_section_id || '';
      } else {
        const res = await apiSdk?.conversations.create(
          {
            // @ts-expect-error -- linter-disable-autofix
            app_id: props.project?.id,
            conversation_name: props?.project?.conversationName,
            get_or_create: true,
            draft_mode: props?.project?.mode === 'draft',
            workflow_id: props?.workflow?.id,
            connector_id: getConnectorId(props),
          },
          {
            headers: {
              'Accept-Language': i18n.language === 'zh-CN' ? 'zh' : 'en',
            },
          },
        );
        conversationId = res?.id || '';
        sectionId = res?.last_section_id || '';
      }
    }
    return { conversationId, sectionId };
  } catch (error) {
    throw {
      code: -1002,
      message: '',
    };
  }
};
