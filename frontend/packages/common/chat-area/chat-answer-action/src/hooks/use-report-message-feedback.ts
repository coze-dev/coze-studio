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
 
import { useToggle } from 'ahooks';
import {
  ReportMessageAction,
  type ReportMessageProps,
} from '@coze-common/chat-core';
import { getReportError } from '@coze-common/chat-area-utils';
import {
  isFallbackErrorMessage,
  useChatArea,
  useMessageBoxContext,
} from '@coze-common/chat-area';

import { ReportEventNames } from '../report-events';
import { useReportMessageFeedbackFn } from '../context/report-message-feedback';

/**
 * @description 消息点赞/点踩
 */
export const useReportMessageFeedback = () => {
  const { reporter } = useChatArea();
  const asyncReportMessage = useReportMessageFeedbackFn();
  const { message } = useMessageBoxContext();
  const { message_id } = message;

  const reportMessageFeedback = async (
    params: Pick<ReportMessageProps, 'message_feedback'>,
  ) => {
    if (isFallbackErrorMessage(message)) {
      return;
    }
    try {
      await asyncReportMessage({
        message_id,
        action: ReportMessageAction.Feedback,
        ...params,
      });

      reporter.successEvent({ eventName: ReportEventNames.ReportMessage });
    } catch (e) {
      reporter.errorEvent({
        eventName: ReportEventNames.ReportMessage,
        ...getReportError(e),
      });
    }
  };

  return reportMessageFeedback;
};

/**
 * @description 获取 点赞按钮组件/点踩按钮组件/点踩原因填写面板组件 props
 */

export const useReportMessageFeedbackHelpers = () => {
  // 点赞成功标识
  const [isThumbsUpSuccessful, { toggle: toogleIsThumbsUpSuccessful }] =
    useToggle<boolean>(false);

  // 点踩成功标识
  const [isFrownUponSuccessful, { toggle: toogleIsFrownUponSuccessful }] =
    useToggle<boolean>(false);

  // 点踩原因填写面板展示
  const [
    isFrownUponPanelVisible,
    {
      setLeft: setIsFrownUponPanelVisibleFalse,
      setRight: setIsFrownUponPanelVisibleTrue,
    },
  ] = useToggle<boolean>(false);

  // 点赞按钮组件onClick事件
  const thumbsUpOnClick = () => {
    toogleIsThumbsUpSuccessful();
    // 点赞/点踩互斥
    if (!isThumbsUpSuccessful && isFrownUponSuccessful) {
      toogleIsFrownUponSuccessful();
      setIsFrownUponPanelVisibleFalse();
    }
  };

  // 点踩按钮组件onClick事件
  const frownUponOnClick = () => {
    toogleIsFrownUponSuccessful();
    // 点赞/点踩互斥
    if (!isFrownUponSuccessful && isThumbsUpSuccessful) {
      toogleIsThumbsUpSuccessful();
    }

    if (!isFrownUponSuccessful) {
      setIsFrownUponPanelVisibleTrue();
    } else {
      setIsFrownUponPanelVisibleFalse();
    }
  };

  // 点踩原因填写面板组件onCancel事件
  const frownUponPanelonCancel = () => {
    setIsFrownUponPanelVisibleFalse();
  };

  // 点踩原因填写面板组件onSubmit事件
  const frownUponPanelonSubmit = () => {
    setIsFrownUponPanelVisibleFalse();
    // 点赞/点踩互斥
    if (isThumbsUpSuccessful) {
      toogleIsThumbsUpSuccessful();
    }
    if (!isFrownUponSuccessful) {
      toogleIsFrownUponSuccessful();
    }
  };

  return {
    isThumbsUpSuccessful,
    isFrownUponSuccessful,
    isFrownUponPanelVisible,
    thumbsUpOnClick,
    frownUponOnClick,
    frownUponPanelonCancel,
    frownUponPanelonSubmit,
  };
};
