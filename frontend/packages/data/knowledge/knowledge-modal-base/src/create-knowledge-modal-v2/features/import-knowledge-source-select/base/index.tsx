import { FormatType } from '@coze-arch/bot-api/knowledge';

import { type ImportKnowledgeSourceSelectModule } from '../module';
import { TextKnowledgeSourceSelect } from './text-knowledge-source-select';
import { TableKnowledgeSourceSelect } from './table-knowledge-source-select';
import { ImageKnowledgeSourceSelect } from './image-knowledge-source-select';

export const ImportKnowledgeSourceSelect: ImportKnowledgeSourceSelectModule =
  props => {
    const { formatType, initValue, onChange } = props;
    if (formatType === FormatType.Text) {
      return (
        <TextKnowledgeSourceSelect initValue={initValue} onChange={onChange} />
      );
    }
    if (formatType === FormatType.Image) {
      return (
        <ImageKnowledgeSourceSelect initValue={initValue} onChange={onChange} />
      );
    }
    if (formatType === FormatType.Table) {
      return (
        <TableKnowledgeSourceSelect initValue={initValue} onChange={onChange} />
      );
    }
  };
