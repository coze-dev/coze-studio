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

import { useEffect, useState } from 'react';

import { isEqual } from 'lodash-es';
import { parseImagesFromOutputData } from '@coze-workflow/base';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';

import { useCurrentNode } from './use-current-node';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useParseImages(outputData: any) {
  const node = useCurrentNode();
  const workflowDocument = useService<WorkflowDocument>(WorkflowDocument);

  const [images, setImages] = useState<string[]>([]);
  useEffect(() => {
    async function parseImages() {
      const workflowJson = await workflowDocument.toNodeJSON(node);
      const res = parseImagesFromOutputData({
        outputData,
        nodeSchema: workflowJson,
      });

      if (!isEqual(res?.sort(), images?.sort())) {
        setImages(res);
      }
    }

    parseImages();
  }, [node, workflowDocument, outputData]);

  return images;
}
