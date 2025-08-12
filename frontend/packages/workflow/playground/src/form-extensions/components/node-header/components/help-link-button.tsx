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

import React from 'react';

import { get } from 'lodash-es';
import { type FlowNodeType } from '@flowgram-adapter/free-layout-editor';
import { type NodeData } from '@coze-workflow/nodes';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { IconCozQuestionMarkCircle } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

export const HelpLinkButton = ({
  helpLink,
  nodeData,
  nodeType,
}: {
  helpLink: string | ((props: { apiName: string }) => string);
  nodeData: NodeData[keyof NodeData];
  nodeType: FlowNodeType;
}) => {
  const handleClick = () => {
    sendTeaEvent(EVENT_NAMES.workflow_test_run_click, {
      nodes_type: String(nodeType),
      action: 'click_doc',
    });
    const path =
      typeof helpLink === 'string'
        ? helpLink
        : helpLink({
            apiName: get(nodeData, 'apiName') || '',
          });
    window.open(path, '_blank');
  };
  return (
    <>
      <IconButton
        onClick={handleClick}
        icon={<IconCozQuestionMarkCircle />}
        size="default"
        color="secondary"
      />
    </>
  );
};
