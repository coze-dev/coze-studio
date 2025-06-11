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
