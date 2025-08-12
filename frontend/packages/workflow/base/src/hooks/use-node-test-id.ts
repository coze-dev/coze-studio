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

import { CustomError } from '@coze-arch/bot-error';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';

import { concatTestId } from '../utils';
import { NODE_TEST_ID_PREFIX } from '../constants';

/**
 * Only used within the node
 */
type UseNodeTestId = () => {
  /**
   * Returns the test-id of the current node, which is the node id of the current node.
   * 'playground.11001
   */
  getNodeTestId: () => string;
  /**
   * Returns the test-id of the current setter, which will automatically bring the test-id of the node.
   * 'playground.11001.llm'
   */
  getNodeSetterId: (setterName: string) => string;
  /**
   * Connect two test-ids to generate a new test-id.
   * ('a', 'b') => 'a.b'
   */
  concatTestId: typeof concatTestId;
};

export const useNodeTestId: UseNodeTestId = () => {
  const node = useCurrentEntity();

  if (!node?.id) {
    throw new CustomError(
      'useNodeTestId must be called in a workflow node',
      '',
    );
  }

  const getNodeTestId = () => concatTestId(NODE_TEST_ID_PREFIX, node.id);

  return {
    /**
     * Returns the test-id of the current node, which is the node id of the current node.
     * 'playground.11001
     */
    getNodeTestId,
    /**
     * Returns the test-id of the current setter, which will automatically bring the test-id of the node.
     * 'playground.11001.llm'
     */
    getNodeSetterId: setterName => concatTestId(getNodeTestId(), setterName),
    /**
     * Connect two test-ids to generate a new test-id.
     * ('a', 'b') => 'a.b'
     */
    concatTestId,
  };
};
