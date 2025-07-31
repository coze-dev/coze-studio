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

import { type PropsWithChildren, type ReactNode } from 'react';

import { object as zObject, string as zString, type TypeOf } from 'zod';
import classNames from 'classnames';
import { VerboseMsgType } from '@coze-common/chat-core';
import { typeSafeJsonParse } from '@coze-common/chat-area-utils';
import { reporter } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozLoading,
  IconCozMagnifier,
  IconCozJump,
  IconCozKnowledge,
  IconCozPlugin,
  IconCozCompass,
} from '@coze-arch/coze-design/icons';
import { Typography } from '@coze-arch/coze-design';
import { Layout } from '@coze-common/chat-uikit-shared';

import { isVerboseContent, isVerboseContentData } from '../../../utils/verbose';
import { safeJSONParse, safeJSONParseV2 } from '../../../utils/safe-json-parse';
import {
  type CollapsePanelHeaderProps,
  type THeaderConfig,
  type MessageExt,
  type ExecuteDisplayName,
} from '../../../utils/fucntion-call/types';
import { ReportEventNames } from '../../../report-events';
import { KNOWLEDGE_OPEN_SEARCH_ERROR } from './knowledge-recall';

import s from './index.module.less';

// failure state
const FAILED = '1';

/**
 * Coze home plugin display, keep it as fallback logic here
 */
const specialPluginNameMap = {
  'ts-bot_creator-bot_creator': {
    en: 'Creating your bot',
    'zh-CN': '正在创建 Bot',
  },
  'ts-Bot_Creator-updateBot': {
    en: 'Updating your bot',
    'zh-CN': '正在更新 Bot',
  },
  'ts-BotCreator-updateBot': {
    en: 'Updating your bot',
    'zh-CN': '正在更新 Bot',
  },
  'ts-generateAndUpdateBotIcon-generateAndUpdateBotIcon': {
    en: "Updating bot's profile picture",
    'zh-CN': '正在更新 Bot 图标',
  },
};

const getIsMapKey = (name: string): name is keyof typeof specialPluginNameMap =>
  name in specialPluginNameMap;

export const getPluginNameText = (name: string): string | null => {
  if (!getIsMapKey(name)) {
    return null;
  }
  const res = specialPluginNameMap[name][I18n.language as 'en'];
  if (!res) {
    return null;
  }
  return res;
};

export const HeaderTitleText: React.FC<
  PropsWithChildren<{ prefix?: ReactNode }>
> = ({ prefix, children }) => (
  <>
    {prefix}
    <span className={classNames(['flex', 'overflow-hidden'])}>{children}</span>
  </>
);

// Bot debugging area calls plugin fallback logic (original logic)
const getFunctionCallMessageIconAndName: (props: {
  content: string;
  ext: MessageExt;
  isLoading: boolean;
  layout?: Layout;
}) => {
  icon: ReactNode;
  title: ReactNode;
} = ({ content, ext, isLoading, layout }) => {
  const { name } = safeJSONParseV2<{ name: string }>(content, {
    name: '',
  }).value ?? { name: '' };

  const { plugin, plugin_request } = ext;
  if (plugin === 'Browser' && plugin_request) {
    return {
      icon: <IconCozCompass />,
      title: (
        <HeaderTitleText
          prefix={isLoading ? I18n.t('Visiting') : I18n.t('Visited')}
        >
          <span className={s['message-tip-ellipsis']}>{plugin_request}</span>
        </HeaderTitleText>
      ),
    };
  }
  if (plugin === 'Google Web Search') {
    return {
      icon: <IconCozMagnifier />,
      title: (
        <HeaderTitleText
          prefix={isLoading ? I18n.t('Searching') : I18n.t('Searched')}
        >
          {plugin_request}
        </HeaderTitleText>
      ),
    };
  }

  // Coze home related tips
  const specialPluginNameText = getPluginNameText(name);

  const prefix = isLoading ? I18n.t('Using') : I18n.t('Used');

  return {
    icon: <IconCozPlugin />,
    title: (
      <HeaderTitleText prefix={specialPluginNameText ? '' : prefix}>
        <Typography.Text
          ellipsis={{ showTooltip: false }}
          className={classNames(
            'text-[unset]',
            layout === Layout.MOBILE ? 'text-[16px]' : 'text-[13px]',
          )}
        >
          {specialPluginNameText ?? plugin}
        </Typography.Text>
      </HeaderTitleText>
    ),
  };
};

// Bot debugging area call plug-in prompt optimization
export const getFunctionCallMessageIconAndNameOptimization: (props: {
  content: string;
  ext: MessageExt;
  resExt?: MessageExt;
  layout?: Layout;
}) => {
  icon: ReactNode;
  title: ReactNode;
} = ({ content, ext, resExt, layout }) => {
  try {
    const executeDisplayName = safeJSONParseV2<ExecuteDisplayName>(
      ext?.execute_display_name || '',
      null,
    );
    // It only fails when it is equal to 1, and succeeds when it is 0 or empty string.
    const message = resExt
      ? resExt.plugin_status === FAILED
        ? executeDisplayName?.value?.name_execute_failed
        : executeDisplayName?.value?.name_executed
      : executeDisplayName?.value?.name_executing;

    if (!message) {
      // Go through the original logic
      // TODO: fallback logic processing After communicating with @Xu Wen, it will be processed at the server level -- @Li Huiwen
      return getFunctionCallMessageIconAndName({
        content,
        ext,
        isLoading: !resExt,
        layout,
      });
    }
    return {
      icon: <IconCozPlugin />,
      title: <HeaderTitleText>{message}</HeaderTitleText>,
    };
  } catch {
    // Go through the original logic
    return getFunctionCallMessageIconAndName({
      content,
      ext,
      isLoading: !resExt,
      layout,
    });
  }
};

export const getKnowledgeMessageHeaderConfig = ({
  isRelatedChatComplete,
  isLatestFunctionCallOfRelatedChat,
  messageUnit,
  isMessageFromOngoingChat,
}: CollapsePanelHeaderProps): THeaderConfig => {
  const contentObj = safeJSONParseV2(messageUnit.llmOutput.content, {
    data: '',
  });
  const dataObj = safeJSONParseV2(contentObj.value?.data ?? '', {
    status_code: 0,
  });
  const executeDisplayName = safeJSONParseV2<ExecuteDisplayName>(
    messageUnit?.llmOutput?.extra_info?.execute_display_name,
    null,
  );
  if (
    messageUnit?.apiResponse?.extra_info?.plugin_status === FAILED ||
    dataObj.value?.status_code === KNOWLEDGE_OPEN_SEARCH_ERROR
  ) {
    return {
      icon: <IconCozKnowledge />,
      title:
        executeDisplayName?.value?.name_execute_failed ||
        I18n.t('bot_preview_searched_dataset'),
      status: 'fail',
    };
  }
  if (
    isLatestFunctionCallOfRelatedChat &&
    !isRelatedChatComplete &&
    isMessageFromOngoingChat
  ) {
    return {
      icon: <IconCozLoading className="animate-spin" />,
      title:
        executeDisplayName?.value?.name_executing ||
        I18n.t('bot_preview_searched_dataset'),
      status: 'loading',
    };
  }
  return {
    icon: <IconCozKnowledge />,
    title:
      executeDisplayName?.value?.name_executed ||
      I18n.t('bot_preview_searched_dataset'),
    status: 'default',
  };
};

export const getHooksMessageHeaderConfig = ({
  messageUnit,
}: CollapsePanelHeaderProps): THeaderConfig => {
  const reportError = (error: Error) => {
    reporter.error({
      message: ReportEventNames.GetHooksMessageHeaderConfig,
      error,
    });
  };

  const hooksCallVerbose = typeSafeJsonParse(
    messageUnit?.llmOutput?.content,
    reportError,
  );

  const HooksCallVerboseSchema = zObject({
    data: zString(),
  });

  const HooksCallVerboseDataSchema = zObject({
    type: zString(),
  });

  type HooksCallVerboseType = TypeOf<typeof HooksCallVerboseSchema>;
  type HooksCallVerboseDataType = TypeOf<typeof HooksCallVerboseDataSchema>;

  if (HooksCallVerboseSchema.safeParse(hooksCallVerbose).success) {
    const hooksCallVerboseData = typeSafeJsonParse(
      (hooksCallVerbose as HooksCallVerboseType).data,
      reportError,
    );

    if (HooksCallVerboseDataSchema.safeParse(hooksCallVerboseData).success) {
      return {
        icon: <IconCozPlugin />,
        title: (
          <HeaderTitleText prefix={I18n.t('codedev_hook_run_log_invoked')}>
            {(hooksCallVerboseData as HooksCallVerboseDataType).type}
          </HeaderTitleText>
        ),
        status: 'default',
      };
    }
  }

  return {
    icon: <IconCozPlugin />,
    title: (
      <HeaderTitleText
        prefix={I18n.t('codedev_hook_invoked_failed')}
      ></HeaderTitleText>
    ),
    status: 'default',
  };
};

const getVerbosePreText = (): Record<string, string> => {
  const text = {
    [VerboseMsgType.JUMP_TO]: I18n.t('agentflow_jump_running_process_jump'),
    [VerboseMsgType.BACK_WORD]: I18n.t(
      'agentflow_jump_running_process_backtrack',
    ),
  };
  return text;
};

export const getVerboseMessageHeaderConfig = ({
  isRelatedChatComplete,
  isLatestFunctionCallOfRelatedChat,
  isMessageFromOngoingChat,
  messageUnit,
}: CollapsePanelHeaderProps): THeaderConfig => {
  const { llmOutput } = messageUnit;
  const content = safeJSONParse(llmOutput.content);
  const executeDisplayName = safeJSONParseV2<ExecuteDisplayName>(
    llmOutput?.extra_info?.execute_display_name || '',
    null,
  );
  if (isVerboseContent(content)) {
    const contentData = safeJSONParse(content.data);

    if (isVerboseContentData(contentData)) {
      /** long-term memory */
      if (content?.msg_type === VerboseMsgType.LONG_TERM_MEMORY) {
        if (
          isLatestFunctionCallOfRelatedChat &&
          !isRelatedChatComplete &&
          isMessageFromOngoingChat
        ) {
          return {
            icon: <IconCozLoading className="animate-spin" />,
            title:
              executeDisplayName?.value?.name_executing ||
              I18n.t('ltm_240227_01'),
            status: 'loading',
          };
        }
        return {
          icon: <IconCozKnowledge />,
          title:
            executeDisplayName?.value?.name_executed || I18n.t('ltm_240227_01'),
          status: 'default',
        };
      }

      /** Jump, backtrack, no loading */
      return {
        icon: <IconCozJump />,
        title: (
          <HeaderTitleText
            prefix={content?.msg_type && getVerbosePreText()[content.msg_type]}
          >
            {contentData?.agent_name}
          </HeaderTitleText>
        ),
        status: 'default',
      };
    }
  }

  /** bottom line */
  return {
    icon: <IconCozJump />,
    title: '',
    status: 'fail',
  };
};
