import { useGetKnowledgeType } from '@coze-data/knowledge-ide-base/hooks/use-case';
import { FormatType } from '@coze-arch/bot-api/knowledge';

import { type BaseKnowledgeIDEProps } from './types';
import { BaseKnowledgeTextIDE } from './text-ide';
import { BaseKnowledgeTableIDE } from './table-ide';
import { BaseKnowledgeImgIDE } from './img-ide';

export type { BaseKnowledgeIDEProps };

export const BaseKnowledgeIDE = (props: BaseKnowledgeIDEProps) => {
  const { dataSetDetail: { format_type } = {} } = useGetKnowledgeType();
  if (format_type === FormatType.Text) {
    return <BaseKnowledgeTextIDE {...props} />;
  }
  if (format_type === FormatType.Table) {
    return <BaseKnowledgeTableIDE {...props} />;
  }
  if (format_type === FormatType.Image) {
    return <BaseKnowledgeImgIDE {...props} />;
  }
  return null;
};
