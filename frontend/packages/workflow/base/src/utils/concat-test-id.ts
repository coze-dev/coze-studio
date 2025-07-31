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

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import { NODE_TEST_ID_PREFIX } from '../constants';

export const concatTestId = (...testIds: string[]) =>
  testIds.filter(id => !!id).join('.');

/**
 * Generate the test ID of the node.
 * @example concatNodeTestId(node, 'right-panel') => playground.node.100001.right-panel
 * @param node
 * @param testIds other id
 * @returns
 */
export const concatNodeTestId = (node: FlowNodeEntity, ...testIds: string[]) =>
  concatTestId(
    node?.id ? concatTestId(NODE_TEST_ID_PREFIX, node.id) : '',
    ...testIds,
  );
