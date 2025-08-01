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

import { useRef, type RefObject } from 'react';

import { debounce } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

import type { ITool } from '../type';
import { ADD_NODE_BUTTON_ID } from '../constants';
export const AddNode = (
  props: ITool & { toolbarRef?: RefObject<HTMLDivElement | undefined> },
) => {
  const { handlers, toolbarRef } = props;
  const { addNode } = handlers;

  const addNodePanelVisibleRef = useRef(false);

  const handleAddNode = (rect: DOMRect) => {
    if (addNodePanelVisibleRef.current) {
      return;
    }
    addNodePanelVisibleRef.current = true;
    const toolbarRect = toolbarRef?.current?.getBoundingClientRect();
    toolbarRect ? (rect = toolbarRect) : null;

    return addNode(rect).finally(
      () => (addNodePanelVisibleRef.current = false),
    );
  };
  const debounceAddNode = debounce(handleAddNode, 100);
  return (
    <Button
      icon={<IconCozPlus />}
      color="highlight"
      id={ADD_NODE_BUTTON_ID}
      onClick={event => {
        debounceAddNode.cancel();
        handleAddNode(event.currentTarget.getBoundingClientRect());
      }}
      onMouseEnter={event => {
        const rect = event.currentTarget.getBoundingClientRect();
        debounceAddNode(rect);
      }}
      onMouseLeave={() => {
        debounceAddNode.cancel();
      }}
      data-testid="workflow.detail.toolbar.add-node"
    >
      {I18n.t('workflow_toolbar_add_node')}
    </Button>
  );
};
