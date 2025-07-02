import { useKnowledgeParams } from '@coze-data/knowledge-stores';
import {
  OptType,
  UnitType,
} from '@coze-data/knowledge-resource-processor-core';
import {
  KnowledgeResourceProcessorLayout,
  type KnowledgeResourceProcessorLayoutProps,
} from '@coze-data/knowledge-resource-processor-base/layout/base';

import { getUploadConfig } from './config';

export type KnowledgeResourceProcessorProps =
  KnowledgeResourceProcessorLayoutProps;

export const KnowledgeResourceProcessor = (
  props: KnowledgeResourceProcessorProps,
) => {
  const { type, opt } = useKnowledgeParams();
  const uploadConfig = getUploadConfig(
    type ?? UnitType.TEXT,
    opt ?? OptType.ADD,
  );
  if (!uploadConfig) {
    return <></>;
  }
  return (
    <KnowledgeResourceProcessorLayout {...props} uploadConfig={uploadConfig} />
  );
};
