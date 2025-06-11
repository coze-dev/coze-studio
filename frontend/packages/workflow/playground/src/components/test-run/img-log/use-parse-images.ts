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
