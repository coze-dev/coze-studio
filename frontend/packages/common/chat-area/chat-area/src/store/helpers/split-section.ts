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

import { type MessageMeta } from '../types';
import { getIsVisibleMessageMeta as builtinGetIsVisibleMessageMeta } from '../../utils/message';
import { type ChatAreaConfigs } from '../../context/chat-area-context/type';

export interface UpdateSectionContextDividerParam {
  metaList: MessageMeta[];
  latestSectionId?: string;
  configs: ChatAreaConfigs;
  getIsVisibleMessageMeta?: typeof builtinGetIsVisibleMessageMeta;
}

/**
 * Scan from back to front
 * Current message is the first answer &
 * The agent split line is only displayed if there is a jumpVerbose message in front of it.
 */
export const updateMetaListDivider = (
  param: UpdateSectionContextDividerParam,
) => {
  const { metaList, configs, getIsVisibleMessageMeta } = param;
  updateDividerByScanList({
    metaList,
    configs,
    getIsVisibleMessageMeta,
  });
};

const updateDividerByScanList = (
  param: Omit<UpdateSectionContextDividerParam, 'latestSectionId'>,
) => {
  const {
    metaList,
    configs,
    getIsVisibleMessageMeta: inputGetIsVisibleMessageMeta,
  } = param;
  const getIsVisibleMessage =
    inputGetIsVisibleMessageMeta ?? builtinGetIsVisibleMessageMeta;

  const visibleMessageMeta = metaList.filter(meta =>
    getIsVisibleMessage(meta, configs),
  );
  if (visibleMessageMeta.length <= 1) {
    return;
  }

  // messageList order is up-to-date presence preceding
  // There is reverse to be paid attention to when rendering.
  for (let i = visibleMessageMeta.length - 1; i > 0; i--) {
    const next = visibleMessageMeta[i - 1];
    const current = visibleMessageMeta[i];

    if (!(current && next)) {
      return;
    }

    // The current message is the first answer & there is a jumpVerbose message in front of it to show the agent split line
    if (next.beforeHasJumpVerbose && next.isGroupFirstAnswer) {
      next.showMultiAgentDivider = true;
    }
  }
};
