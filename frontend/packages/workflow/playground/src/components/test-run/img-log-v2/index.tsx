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

import { LogImages } from '@coze-workflow/test-run';
import { type NodeResult } from '@coze-workflow/base';

import { useImages } from './use-images';

export const ImgLogV2: React.FC<{
  testRunResult: NodeResult;
  nodeId?: string;
}> = ({ testRunResult, nodeId }) => {
  const { images, downloadImages } = useImages(testRunResult, nodeId);

  return <LogImages images={images} onDownload={downloadImages} />;
};
