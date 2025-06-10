import { useMemo } from 'react';

import { type UnitType } from '@coze-data/knowledge-resource-processor-core';
import { FormatType } from '@coze-arch/bot-api/knowledge';

import { type ImportKnowledgeRadioSourceFeatureRegistry } from '../import-knowledge-sources/radio/registry';
import { KnowledgeSourceRadioGroup as KnowledgeSourceRadioGroupComponent } from '../../components/knowledge-source-radio-group';
import { importTextKnowledgeSourceRadioGroupContributes } from './import-text-knowledge-source-contributes';
import { importTableKnowledgeSourceRadioGroupContributes } from './import-table-knowledge-source-contributes';
import { importImageKnowledgeSourceRadioGroupContributes } from './import-image-knowledge-source-contributes';

export interface ImportKnowledgeSourceRadioGroupProps {
  formatType: FormatType;
  value?: UnitType;
  importKnowledgeSourceRegistry: ImportKnowledgeRadioSourceFeatureRegistry;
  onChange?: (val: UnitType) => void;
}

export const ImportKnowledgeSourceRadioGroup = (
  props: ImportKnowledgeSourceRadioGroupProps,
) => {
  const { value, onChange, formatType } = props;
  const importKnowledgeSourceRegistry = useMemo(() => {
    if (formatType === FormatType.Text) {
      return importTextKnowledgeSourceRadioGroupContributes;
    }
    if (formatType === FormatType.Table) {
      return importTableKnowledgeSourceRadioGroupContributes;
    }
    if (formatType === FormatType.Image) {
      return importImageKnowledgeSourceRadioGroupContributes;
    }
  }, [formatType]);
  if (!importKnowledgeSourceRegistry) {
    return null;
  }

  return (
    <KnowledgeSourceRadioGroupComponent
      value={value}
      onChange={e => {
        onChange?.(e.target.value);
      }}
    >
      {importKnowledgeSourceRegistry.entries().map(([key, { Component }]) => (
        <Component key={key} />
      ))}
    </KnowledgeSourceRadioGroupComponent>
  );
};
