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

import { type ReactNode } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozLoading,
  IconCozWarningCircle,
  IconCozArrowDown,
  IconCozCheckMarkCircle,
  IconCozListDisorder,
} from '@coze-arch/coze-design/icons';
import { Typography, Tag } from '@coze-arch/coze-design';
import { MockHitStatus } from '@coze-arch/bot-api/debugger_api';
import { Layout } from '@coze-common/chat-uikit-shared';

import { safeJSONParse } from '../../../utils/safe-json-parse';
import {
  MessageUnitRole,
  type MockHitInfo,
  type FunctionCallMessageUnit,
  type CollapsePanelHeaderProps,
  type THeaderConfig,
  type ProcessStatus,
} from '../../../utils/fucntion-call/types';
import { getMessageTimeCost } from '../../../utils/fucntion-call/function-message-unit';
import { usePreference } from '../../../context/preference';
import {
  getFunctionCallMessageIconAndNameOptimization,
  getHooksMessageHeaderConfig,
  getKnowledgeMessageHeaderConfig,
  getVerboseMessageHeaderConfig,
} from './function-call-message';

import s from './index.module.less';
const HeaderTitle: React.FC<{
  icon?: ReactNode;
  title?: ReactNode;
  color?: string;
  layout?: Layout;
}> = ({ icon, title, color, layout }) => (
  <Typography.Text
    data-testid="chat-area.fncall.header-title"
    className={s['header-title']}
    ellipsis={{ showTooltip: false }}
    style={{
      color,
    }}
  >
    {icon}
    <span
      className={classNames('overflow-hidden', [
        'flex',
        'gap-x-4px',
        'items-center',
        layout === Layout.MOBILE ? 'text-[16px]' : 'text-[13px]',
      ])}
    >
      {title}
    </span>
  </Typography.Text>
);

const getTopLevelOfTheNestedPanelHeaderConfig = ({
  isPanelOpen,
  isRelatedChatComplete,
  isRelatedChatAllFunctionCallSuccess,
  isMessageFromOngoingChat,
  isFakeInterruptAnswer,
}: CollapsePanelHeaderProps): THeaderConfig | undefined => {
  if (isPanelOpen) {
    return {
      icon: <IconCozListDisorder />,
      title: I18n.t('bot_preview_hide_running_process'),
      status: 'default',
    };
  }
  if (isRelatedChatComplete) {
    return isRelatedChatAllFunctionCallSuccess
      ? {
          icon: <IconCozCheckMarkCircle />,
          title: I18n.t('bot_preview_run_completed'),
          status: 'success',
        }
      : {
          icon: <IconCozWarningCircle />,
          title: I18n.t('bot_preview_run_completed'),
          status: 'fail',
        };
  } else {
    if (isFakeInterruptAnswer) {
      return {
        icon: <IconCozCheckMarkCircle />,
        title: I18n.t('bot_debug_question_wait'),
        status: 'success',
      };
    }
    if (!isMessageFromOngoingChat) {
      return {
        icon: <IconCozWarningCircle />,
        title: I18n.t('bot_preview_run_terminated'),
        status: 'interrupt',
      };
    }
  }
};

const getHeaderConfig = (
  headerProps: CollapsePanelHeaderProps,
): THeaderConfig => {
  const {
    isTopLevelOfTheNestedPanel,
    messageUnit,
    isMessageFromOngoingChat,
    layout,
  } = headerProps;
  if (isTopLevelOfTheNestedPanel) {
    const topLevelConfig = getTopLevelOfTheNestedPanelHeaderConfig(headerProps);
    // If there is no match, use the last function call unit of the corresponding dialogue to render
    if (topLevelConfig) {
      return topLevelConfig;
    }
  }

  if (messageUnit.role === MessageUnitRole.DATA_SET) {
    return getKnowledgeMessageHeaderConfig(headerProps);
  }
  if (messageUnit.role === MessageUnitRole.VERBOSE) {
    return getVerboseMessageHeaderConfig(headerProps);
  }
  if (messageUnit.role === MessageUnitRole.HOOKS) {
    return getHooksMessageHeaderConfig(headerProps);
  }

  const { apiResponse, llmOutput, isFinish } = messageUnit;
  // Streaming plugins and asynchronous plugins are special, and the end is only counted when the end message is received.
  const hasResponse = apiResponse && isFinish;
  const functionCallIconAndName = getFunctionCallMessageIconAndNameOptimization(
    {
      content: llmOutput.content,
      ext: llmOutput.extra_info,
      resExt: apiResponse?.extra_info,
      layout,
    },
  );

  // Response is empty
  if (!hasResponse) {
    // Chat history
    if (!isMessageFromOngoingChat) {
      return {
        icon: functionCallIconAndName.icon,
        title: functionCallIconAndName.title,
        status: 'interrupt',
      };
    }
    // Current conversation in progress
    return {
      icon: <IconCozLoading className="animate-spin" />,
      title: functionCallIconAndName.title,
      status: 'loading',
    };
  }

  // normal return logic
  return {
    icon: functionCallIconAndName.icon,
    title: functionCallIconAndName.title,
    status: apiResponse.extra_info.plugin_status === '1' ? 'fail' : 'default',
  };
};

const getTextColor = (param: {
  status: ProcessStatus;
  isTopLevelOfTheNestedPanel: boolean;
  isPanelOpen?: boolean;
}) => {
  const { status, isPanelOpen, isTopLevelOfTheNestedPanel } = param;
  if (status === 'fail') {
    return 'var(--coz-fg-hglt-yellow)';
  }
  if (isTopLevelOfTheNestedPanel) {
    if (isPanelOpen) {
      return 'var(--coz-fg-primary)';
    }
    if (status === 'success') {
      return 'var(--coz-fg-hglt-green)';
    }
    if (status === 'interrupt') {
      return 'var(--coz-fg-dim)';
    }
    return 'var(--coz-fg-hglt)';
  }
  if (status === 'loading') {
    return 'var(--coz-fg-hglt)';
  }
  return 'var(--coz-fg-primary)';
};

const getLLMTime = (messageUnit: FunctionCallMessageUnit) => {
  if (
    [MessageUnitRole.DATA_SET, MessageUnitRole.VERBOSE].includes(
      messageUnit.role,
    )
  ) {
    return `${messageUnit.time}s`;
  }
  if (messageUnit.role === MessageUnitRole.TOOL) {
    const llmTime = getMessageTimeCost(messageUnit.llmOutput.extra_info);
    const apiTime = getMessageTimeCost(messageUnit.apiResponse?.extra_info);
    const subTimeList = [
      {
        label: I18n.t('debug_area_time_label_model'),
        value: llmTime,
      },
      {
        label: I18n.t('debug_area_time_label_tool'),
        value: apiTime,
      },
    ].filter(t => t.value);
    const subTimeNode = (
      <>{subTimeList.map(t => `${t.label}${t.value}s`).join('｜')}</>
    );
    return (
      <>
        {messageUnit.time}s : {subTimeNode}
      </>
    );
  }
  return null;
};

export const CollapsePanelHeader: React.FC<
  CollapsePanelHeaderProps
> = props => {
  const {
    messageUnit,
    isTopLevelOfTheNestedPanel,
    isPanelOpen,
    isRelatedChatComplete,
    expandable,
    hitMockSet,
  } = props;
  const { icon, title, status } = getHeaderConfig(props);
  const textColor = getTextColor({
    status,
    isPanelOpen,
    isTopLevelOfTheNestedPanel,
  });

  const mockHitInfo = safeJSONParse(
    messageUnit?.apiResponse?.extra_info?.mock_hit_info ?? '{}',
  );
  const hitMock =
    typeof mockHitInfo === 'object'
      ? (mockHitInfo as MockHitInfo).hitStatus === MockHitStatus.Success
      : false;

  const { layout } = usePreference();

  return (
    <div
      className={classNames(
        s.header,
        !expandable && s['header-no-expandable'],
        status === 'fail' && s['header-fail'],
      )}
      style={{ color: textColor }}
    >
      <div className="flex items-center overflow-hidden">
        <HeaderTitle
          color={textColor}
          icon={icon}
          title={title}
          layout={layout}
        />
        {isTopLevelOfTheNestedPanel &&
        !isPanelOpen &&
        (hitMock || (isRelatedChatComplete && hitMockSet)) ? (
          <Tag color="primary" className="ml-[8px]">
            {I18n.t('mockset')}
          </Tag>
        ) : null}
      </div>
      {expandable ? (
        <>
          {isTopLevelOfTheNestedPanel ? (
            <IconCozArrowDown
              style={{ marginLeft: '6px', justifySelf: 'flex-end' }}
              className={classNames(isPanelOpen ? 'rotate-180' : 'rotate-0')}
            />
          ) : (
            <div className={s['llm-time']}>{getLLMTime(messageUnit)}</div>
          )}
        </>
      ) : null}
    </div>
  );
};
