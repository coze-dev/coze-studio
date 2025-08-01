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
