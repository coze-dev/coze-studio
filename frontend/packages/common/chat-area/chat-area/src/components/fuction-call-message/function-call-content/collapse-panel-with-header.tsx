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

/* eslint-disable @coze-arch/max-line-per-function */
import {
  type CSSProperties,
  type ForwardedRef,
  forwardRef,
  memo,
  type PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import { object as zObject, string as zString, type TypeOf } from 'zod';
import { isUndefined, omit } from 'lodash-es';
import classNames from 'classnames';
import { JsonViewer } from '@coze-common/json-viewer';
import { VerboseMsgType } from '@coze-common/chat-core';
import { typeSafeJsonParse } from '@coze-common/chat-area-utils';
import { reporter } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { Collapsible, Tag, Button } from '@coze-arch/coze-design';
import { MdBoxLazy } from '@coze-arch/bot-md-box-adapter/lazy';
import { MockHitStatus } from '@coze-arch/bot-api/debugger_api';

import {
  isKnowledgeRecallVerboseContentDeprecated,
  isVerboseContent,
  isVerboseContentData,
} from '../../../utils/verbose';
import { safeJSONParse } from '../../../utils/safe-json-parse';
import {
  type CollapsePanelHeaderProps,
  type FunctionCallMessageUnit,
  MessageUnitRole,
  type MockHitInfo,
  type HooksCallVerboseData,
} from '../../../utils/fucntion-call/types';
import { primitiveExhaustiveCheck } from '../../../utils/exhaustive-check';
import { ReportEventNames } from '../../../report-events';
import { useShowBackGround } from '../../../hooks/public/use-show-bgackground';
import { usePreference } from '../../../context/preference';
import { ProcessContent } from './process-content';
import {
  LegacyKnowledgeRecall,
  VerboseKnowledgeRecall,
} from './knowledge-recall';
import { CollapsePanelHeader } from './collapse-panel-header';
import { APITag } from './api-tag';

import s from './index.module.less';

export interface CollapsePanelWithHeaderProps extends CollapsePanelHeaderProps {
  expandable: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

export interface CollapsePanelWithHeaderRef {
  open: () => void;
  close: () => void;
}

const omitFields = ['plugin_id', 'api_id', 'plugin_type'];

const JsonViewerWithFilter: React.FC<{ content: string }> = memo(
  ({ content }) => {
    const parsed = safeJSONParse(content);
    if (parsed && typeof parsed === 'object') {
      const deepParsed = Object.entries(omit(parsed, omitFields)).reduce(
        (res, [key, value]) => {
          if (
            typeof value === 'string' &&
            (value.startsWith('{') || value.startsWith('['))
          ) {
            return {
              ...res,
              [key]: safeJSONParse(value) || value,
            };
          }
          return {
            ...res,
            [key]: value,
          };
        },
        {},
      );
      return <JsonViewer data={deepParsed} />;
    }
    return (
      <div className={s['md-box-wrapper']}>
        <MdBoxLazy
          markDown={content}
          imageOptions={{ forceHttps: !IS_OPEN_SOURCE }}
        />
      </div>
    );
  },
);

const LLMAndAPIContent: React.FC<{
  functionCallMessageUnit: FunctionCallMessageUnit;
}> = ({ functionCallMessageUnit }) => {
  const { llmOutput, apiResponse } = functionCallMessageUnit;
  const { plugin, tool_name } = llmOutput.extra_info;
  const mockHitInfo = safeJSONParse(
    apiResponse?.extra_info?.mock_hit_info ?? '{}',
  );
  const hitMock =
    typeof mockHitInfo === 'object'
      ? (mockHitInfo as MockHitInfo).hitStatus === MockHitStatus.Success
      : false;
  const mockSetName =
    typeof mockHitInfo === 'object'
      ? (mockHitInfo as MockHitInfo).mockSetName || ''
      : '';

  return (
    <>
      <div
        className={classNames(s['llm-api-name'], 'coz-fg-primary')}
      >{`${plugin}.${tool_name}`}</div>
      <div
        className={s['llm-api-content']}
        style={apiResponse && { marginBottom: '8px' }}
      >
        <APITag type="Request" />
        <JsonViewerWithFilter content={llmOutput.content} />
      </div>
      {apiResponse ? (
        <div className={s['llm-api-content']}>
          <div className="flex items-center">
            <APITag type="Response" />
            {hitMock ? (
              <Tag color="primary" className="ml-[8px] mb-[8px] max-w-[144px]">
                {`${I18n.t('mockset_label_tip', {
                  MockSetName: mockSetName,
                })}`}
              </Tag>
            ) : null}
          </div>
          <JsonViewerWithFilter content={apiResponse.content} />
        </div>
      ) : null}
    </>
  );
};

const getVerboseContent = (llmContent: string) => {
  const content = safeJSONParse(llmContent);
  if (!isVerboseContent(content)) {
    return;
  }
  const { data, msg_type } = content;

  const contentData = safeJSONParse(data);
  if (!isVerboseContentData(contentData)) {
    return;
  }

  switch (msg_type) {
    // backtracking node copy
    case VerboseMsgType.BACK_WORD: {
      const startMode = I18n.t(
        'agentflow_transfer_ conversation_settings_backtrack_start',
      );
      const previousMode = I18n.t(
        'agentflow_transfer_ conversation_settings_backtrack_previous',
      );
      return `${I18n.t('agentflow_jump_running_process_trigger_condition')}${
        contentData?.restart ? startMode : previousMode
      }`;
    }
    // jump node copy
    case VerboseMsgType.JUMP_TO: {
      return `${I18n.t('agentflow_jump_running_process_trigger_condition')}${
        contentData?.condition ?? ''
      }`;
    }
    //  long-term memory node copy
    case VerboseMsgType.LONG_TERM_MEMORY: {
      return contentData?.wraped_text ?? '';
    }
    //Default direct display json
    default: {
      return llmContent;
    }
  }
};

// hook_call type
const renderHooksMessage = (messageUnit: FunctionCallMessageUnit) => {
  const reportError = (error: Error) => {
    reporter.error({
      message: ReportEventNames.MessageUnitRoleHooksError,
      error,
    });
  };
  const parsedContent = typeSafeJsonParse(
    messageUnit?.llmOutput.content,
    reportError,
  );

  const HooksCallVerboseDataSchema = zObject({
    type: zString(),
    uri: zString(),
    log_id: zString(),
  });

  type HooksCallVerboseDataType = TypeOf<typeof HooksCallVerboseDataSchema>;

  if (isVerboseContent(parsedContent)) {
    const dataContent = typeSafeJsonParse(
      parsedContent?.data ?? '',
      reportError,
    );

    if (HooksCallVerboseDataSchema.safeParse(dataContent).success) {
      return (
        <ProcessContent>
          {['type', 'log_id', 'uri'].map(item => (
            <div>
              <span className={s['hook-label']}>{item}：</span>
              <span className="whitespace-pre-wrap break-words">
                {
                  (dataContent as HooksCallVerboseDataType)?.[
                    item as keyof HooksCallVerboseData
                  ] as string
                }
              </span>
            </div>
          ))}
        </ProcessContent>
      );
    }
  }
  return (
    <ProcessContent>{I18n.t('codedev_hook_invoked_failed')}</ProcessContent>
  );
};

const CollapsePanelWithHeaderImpl = forwardRef(
  (
    props: PropsWithChildren<CollapsePanelWithHeaderProps>,
    ref: ForwardedRef<CollapsePanelWithHeaderRef>,
  ) => {
    const {
      onOpenChange,
      isPanelOpen,
      children,
      isTopLevelOfTheNestedPanel,
      messageUnit,
      className,
      style,
      isLatestFunctionCallOfRelatedChat,
      isMessageFromOngoingChat,
      isRelatedChatComplete,
      isRelatedChatAllFunctionCallSuccess,
      expandable,
      hitMockSet,
      isFakeInterruptAnswer,
    } = props;

    const { layout } = usePreference();

    const [isOpenInner, setOpenInner] = useState(false);
    const isControlled = !isUndefined(isPanelOpen);
    const isOpenHandled = isControlled ? isPanelOpen : isOpenInner;
    const showBackground = useShowBackGround();
    const handleOpenChange = () => {
      if (!expandable) {
        return;
      }

      setOpenInner(v => {
        onOpenChange?.(!v);
        return !v;
      });
    };

    const renderChildren = () => {
      if (isTopLevelOfTheNestedPanel) {
        return children;
      }

      if (messageUnit.role === MessageUnitRole.HOOKS) {
        return renderHooksMessage(messageUnit);
      }

      if (messageUnit.role === MessageUnitRole.DATA_SET) {
        const parsedContent = safeJSONParse(messageUnit?.llmOutput.content);
        if (isKnowledgeRecallVerboseContentDeprecated(parsedContent)) {
          return <VerboseKnowledgeRecall chunks={parsedContent.chunks} />;
        }

        if (isVerboseContent(parsedContent)) {
          const knowledgeRecallContent = safeJSONParse(parsedContent.data);
          if (isVerboseContentData(knowledgeRecallContent)) {
            return (
              <VerboseKnowledgeRecall
                chunks={knowledgeRecallContent.chunks}
                statusCode={knowledgeRecallContent.status_code}
              />
            );
          }
        }

        return (
          <LegacyKnowledgeRecall content={messageUnit.llmOutput.content} />
        );
      }

      if (messageUnit.role === MessageUnitRole.VERBOSE) {
        return (
          <ProcessContent>
            {getVerboseContent(messageUnit.llmOutput.content)}
          </ProcessContent>
        );
      }
      if (messageUnit.role === MessageUnitRole.TOOL) {
        const responseContent = safeJSONParse(
          messageUnit?.apiResponse?.content,
        );
        if (isKnowledgeRecallVerboseContentDeprecated(responseContent)) {
          return <VerboseKnowledgeRecall chunks={responseContent.chunks} />;
        }

        return (
          <ProcessContent>
            <LLMAndAPIContent functionCallMessageUnit={messageUnit} />
          </ProcessContent>
        );
      }
      primitiveExhaustiveCheck(messageUnit.role);
      return children;
    };

    const getPanelWidth = () => {
      if (!isTopLevelOfTheNestedPanel) {
        return;
      }
      return isOpenHandled ? 'calc(100%)' : 'fit-content';
    };

    useImperativeHandle(ref, () => ({
      open: () => setOpenInner(true),
      close: () => setOpenInner(false),
    }));

    useEffect(() => {
      if (isControlled) {
        setOpenInner(isPanelOpen);
      }
    }, [isControlled, isPanelOpen]);

    return (
      <div
        className={className}
        style={{
          width: getPanelWidth(),
          ...style,
        }}
      >
        {
          <Button
            color="secondary"
            className={classNames('!h-full', {
              [s['collapse-item-header-top-level'] as string]:
                isTopLevelOfTheNestedPanel,
              [s['collapse-item-header'] as string]:
                !isTopLevelOfTheNestedPanel,
              [s['collapse-item-header-main'] as string]:
                isTopLevelOfTheNestedPanel && !isOpenHandled,
              [s['collapse-item-header-active'] as string]:
                !isTopLevelOfTheNestedPanel && isOpenHandled,
              [s['collapse-background'] as string]: showBackground,
            })}
            contentClassName={'w-full'}
            onClick={handleOpenChange}
          >
            <CollapsePanelHeader
              messageUnit={messageUnit}
              isTopLevelOfTheNestedPanel={isTopLevelOfTheNestedPanel}
              isPanelOpen={isOpenHandled}
              isLatestFunctionCallOfRelatedChat={
                isLatestFunctionCallOfRelatedChat
              }
              isRelatedChatComplete={isRelatedChatComplete}
              isMessageFromOngoingChat={isMessageFromOngoingChat}
              isRelatedChatAllFunctionCallSuccess={
                isRelatedChatAllFunctionCallSuccess
              }
              expandable={expandable}
              hitMockSet={hitMockSet}
              isFakeInterruptAnswer={isFakeInterruptAnswer}
              layout={layout}
            />
          </Button>
        }
        <Collapsible
          keepDOM
          lazyRender
          className={s.collapsible}
          isOpen={isOpenHandled}
          style={!isOpenHandled ? { width: 0 } : {}}
        >
          {renderChildren()}
        </Collapsible>
      </div>
    );
  },
);

export const CollapsePanelWithHeader = memo(CollapsePanelWithHeaderImpl);
