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
 * @description Message Like/Click
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
 * @description Get, like button component/click button component/click button reason Fill in the panel component props
 */

export const useReportMessageFeedbackHelpers = () => {
  // Like success logo
  const [isThumbsUpSuccessful, { toggle: toogleIsThumbsUpSuccessful }] =
    useToggle<boolean>(false);

  // Click on the success sign
  const [isFrownUponSuccessful, { toggle: toogleIsFrownUponSuccessful }] =
    useToggle<boolean>(false);

  // Click on the reason to fill in the panel display
  const [
    isFrownUponPanelVisible,
    {
      setLeft: setIsFrownUponPanelVisibleFalse,
      setRight: setIsFrownUponPanelVisibleTrue,
    },
  ] = useToggle<boolean>(false);

  // Like button component onClick event
  const thumbsUpOnClick = () => {
    toogleIsThumbsUpSuccessful();
    // Like/click on mutual exclusion
    if (!isThumbsUpSuccessful && isFrownUponSuccessful) {
      toogleIsFrownUponSuccessful();
      setIsFrownUponPanelVisibleFalse();
    }
  };

  // Click button component onClick event
  const frownUponOnClick = () => {
    toogleIsFrownUponSuccessful();
    // Like/click on mutual exclusion
    if (!isFrownUponSuccessful && isThumbsUpSuccessful) {
      toogleIsThumbsUpSuccessful();
    }

    if (!isFrownUponSuccessful) {
      setIsFrownUponPanelVisibleTrue();
    } else {
      setIsFrownUponPanelVisibleFalse();
    }
  };

  // Click on the reason to fill in the panel component onCancel event
  const frownUponPanelonCancel = () => {
    setIsFrownUponPanelVisibleFalse();
  };

  // Click on the reason to fill in the panel component onSubmit event
  const frownUponPanelonSubmit = () => {
    setIsFrownUponPanelVisibleFalse();
    // Like/click on mutual exclusion
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
