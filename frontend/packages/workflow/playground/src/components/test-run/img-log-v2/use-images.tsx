import { useEffect, useState } from 'react';

import { isEqual } from 'lodash-es';
import { NodeExeStatus, type NodeResult } from '@coze-workflow/base';
import { parseImagesFromOutputData } from '@coze-workflow/base';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';
import type { FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { useService, usePlayground } from '@flowgram-adapter/free-layout-editor';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';

import { useDownloadImages } from '../img-log/use-download-images';

export function useImages(
  testRunResult: NodeResult,
  nodeId?: string,
): {
  images: string[];
  downloadImages: () => void;
} {
  const playground = usePlayground();

  const workflowDocument = useService<WorkflowDocument>(WorkflowDocument);
  const [images, setImages] = useState<string[]>([]);

  const downloadImages = useDownloadImages(images);

  useEffect(() => {
    async function parseImages() {
      if (!nodeId) {
        return;
      }
      let outputsValue;

      if (testRunResult?.nodeStatus === NodeExeStatus.Success) {
        const log =
          testRunResult?.NodeType === 'End' ||
          testRunResult?.NodeType === 'Message'
            ? testRunResult?.input
            : testRunResult?.output || '';

        outputsValue = typeSafeJSONParse(log);
      }
      const node =
        playground.entityManager.getEntityById<FlowNodeEntity>(nodeId);
      if (!node) {
        return;
      }
      const workflowJson = await workflowDocument.toNodeJSON(node);
      const res = parseImagesFromOutputData({
        outputData: outputsValue,
        nodeSchema: workflowJson,
      });

      if (!isEqual(res?.sort(), images?.sort())) {
        setImages(res);
      }
    }

    parseImages();
  }, [nodeId, workflowDocument, testRunResult, images, playground]);

  return {
    images,
    downloadImages,
  };
}
