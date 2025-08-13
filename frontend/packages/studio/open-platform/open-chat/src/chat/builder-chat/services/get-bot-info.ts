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

import { cloneDeep } from 'lodash-es';
import i18n from '@coze-arch/i18n/intl';
import { type CozeAPI } from '@coze/api';

import { EInputMode } from '@/types/props';
import ChatFlowUserIcon from '@/assets/chatflow-logo.png';

import { type IBuilderChatProps } from '../type';
import { getConnectorId } from '../helper/get-connector-id';
import {
  type ProjectInfoResp,
  type WorkflowInfoResp,
  type InitData,
  type CozeApiFullFilledRes,
} from '../data-type';
const getFormatAppData = (
  appData?: ProjectInfoResp['data'],
  workflowData?: WorkflowInfoResp['role'],
  props?: IBuilderChatProps,
): InitData => {
  const appInfoResult: InitData = {
    prologue: workflowData?.onboarding_info?.prologue || '',
    onboardingSuggestions:
      workflowData?.onboarding_info?.suggested_questions?.map(
        (item, index) => ({
          id: index.toString(),
          content: item,
        }),
      ) || [],
    displayAllSuggest: workflowData?.onboarding_info?.display_all_suggestions,
    botInfo: {
      url: workflowData?.avatar?.image_url || appData?.icon_url || '',
      nickname:
        workflowData?.name || appData?.name || props?.project.defaultName || '',
      id: props?.project?.id || '',
    },
    suggestPromoteInfo: {
      suggestReplyMode: workflowData?.suggest_reply_info?.suggest_reply_mode,
      customizedSuggestPrompt:
        workflowData?.suggest_reply_info?.customized_suggest_prompt,
    },
    backgroundInfo: workflowData?.background_image_info,
    defaultInputMode:
      workflowData?.user_input_config?.default_input_mode === 2
        ? EInputMode.Voice
        : EInputMode.Text,
  };

  // 内部插件中用的是origin_image_url，但是这里origin_image_url 会过期，因此使用image_url重写
  if (appInfoResult.backgroundInfo?.web_background_image) {
    appInfoResult.backgroundInfo.web_background_image.origin_image_url =
      appInfoResult.backgroundInfo.web_background_image.image_url;
  }
  if (appInfoResult.backgroundInfo?.mobile_background_image) {
    appInfoResult.backgroundInfo.mobile_background_image.origin_image_url =
      appInfoResult.backgroundInfo.mobile_background_image.image_url;
  }

  return appInfoResult;
};

export const combineAppDataWithProps = (
  appInfoResultRaw: InitData,
  props?: IBuilderChatProps,
): InitData => {
  const appInfoResult = cloneDeep(appInfoResultRaw);

  if (props?.project?.id) {
    appInfoResult.botInfo.id = props?.project?.id;
  }
  if (props?.project?.name) {
    appInfoResult.botInfo.nickname = props?.project?.name;
  }
  if (props?.project?.iconUrl) {
    appInfoResult.botInfo.url = props?.project?.iconUrl;
  }

  if (props?.project?.onBoarding?.prologue) {
    appInfoResult.prologue = props?.project?.onBoarding?.prologue;
  }
  if (props?.project?.onBoarding?.suggestions?.length) {
    appInfoResult.onboardingSuggestions =
      props?.project?.onBoarding?.suggestions.map((item, index) => ({
        id: index.toString(),
        content: item,
      })) || [];
  }
  if (props?.project?.onBoarding?.displayAllSuggest) {
    appInfoResult.displayAllSuggest =
      props?.project?.onBoarding?.displayAllSuggest;
  }

  if (!appInfoResult.displayAllSuggest) {
    appInfoResult.onboardingSuggestions =
      appInfoResult.onboardingSuggestions.slice(0, 3);
  }

  if (props?.project?.suggestPromoteInfo?.suggestReplyMode) {
    appInfoResult.suggestPromoteInfo = {
      suggestReplyMode: props?.project?.suggestPromoteInfo?.suggestReplyMode,
      customizedSuggestPrompt:
        props?.project?.suggestPromoteInfo?.customizedSuggestPrompt,
    };
  }

  if (props?.areaUi?.bgInfo?.imgUrl) {
    // 去掉backgroundInfo， 使用本地写的背景组件，不再使用插件进行背景显示。
    appInfoResult.customBgInfo = props?.areaUi?.bgInfo;
  } else {
    appInfoResult.customBgInfo = undefined;
  }
  return appInfoResult;
};

export const getBotInfo = async (
  apiSdk: CozeAPI | undefined,
  props: IBuilderChatProps,
) => {
  const connectorId = getConnectorId(props);
  const isWebSdk = props?.project?.mode === 'websdk';
  const workflowId = props?.workflow?.id;
  const isDebugParam = props?.project?.mode === 'draft' ? 'true' : '';
  const callerParam = props?.project?.caller || '';
  const lang = i18n.language;
  console.log('i18n.language', lang);
  const [appRes, workflowRes] = await Promise.allSettled([
    isWebSdk
      ? apiSdk?.get<unknown, ProjectInfoResp>(
          `/v1/apps/${props?.project?.id}?version=${props?.project?.version || ''}&connector_id=${connectorId}`,
          {},
          false,
          {
            headers: {
              'Accept-Language': i18n.language === 'zh-CN' ? 'zh' : 'en',
            },
          },
        )
      : null,

    workflowId
      ? apiSdk?.get<unknown, { data: WorkflowInfoResp }>(
          `/v1/workflows/${workflowId}?${[
            `connector_id=${connectorId}`,
            `is_debug=${isDebugParam}`,
            `caller=${callerParam}`,
          ].join('&')}`,
          {},
          false,
          {
            headers: {
              'Accept-Language': i18n.language === 'zh-CN' ? 'zh' : 'en',
            },
          },
        )
      : null,
  ]);
  const appData =
    appRes?.status === 'fulfilled' ? appRes?.value?.data : undefined;
  const workflowData =
    workflowRes?.status === 'fulfilled'
      ? workflowRes?.value?.data?.role
      : undefined;
  if (isWebSdk && !appData) {
    throw { code: (appRes as CozeApiFullFilledRes)?.reason?.code, message: '' };
  }
  const appInfo = getFormatAppData(appData, workflowData, props);
  if (props?.workflow?.id && !appInfo.botInfo.url) {
    appInfo.botInfo.url = ChatFlowUserIcon;
  }

  return appInfo;
};
