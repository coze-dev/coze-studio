import type { ReactNode } from 'react';

import { type UnitType } from '@coze-data/knowledge-resource-processor-core';

import { useKnowledgeIDERegistry } from '../../context/knowledge-ide-registry-context';
import { KnowledgeSourceMenu as KnowledgeSourceMenuComponent } from '../../components/knowledge-source-menu';

export interface ImportKnowledgeSourceMenuProps {
  triggerComponent?: ReactNode;
  onVisibleChange?: (visible: boolean) => void;
  onChange?: (val: UnitType) => void;
}

export const ImportKnowledgeSourceMenu = (
  props: ImportKnowledgeSourceMenuProps,
) => {
  const { triggerComponent, onVisibleChange, onChange } = props;
  const { importKnowledgeMenuSourceFeatureRegistry } =
    useKnowledgeIDERegistry();

  return (
    <KnowledgeSourceMenuComponent
      triggerComponent={triggerComponent}
      onVisibleChange={onVisibleChange}
    >
      {importKnowledgeMenuSourceFeatureRegistry
        ?.entries()
        .map(([key, { Component }]) => (
          <Component key={key} onClick={value => onChange?.(value)} />
        ))}
    </KnowledgeSourceMenuComponent>
  );
};
