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

import { type FC } from 'react';

import { useKnowledgeStore } from '@coze-data/knowledge-stores';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { Divider } from '@coze-arch/coze-design';

import { FilterPhotoType } from '@/types';

import styles from './index.module.less';

export const PhotoFilter: FC = () => {
  const photoFilterValue = useKnowledgeStore(state => state.photoFilterValue);
  const setPhotoFilterValue = useKnowledgeStore(
    state => state.setPhotoFilterValue,
  );

  return (
    <div className={styles['photo-filter-tab']}>
      <div
        data-testid={KnowledgeE2e.ImageAnnotationAllTab}
        key={FilterPhotoType.All}
        onClick={() => setPhotoFilterValue(FilterPhotoType.All)}
        className={
          photoFilterValue === FilterPhotoType.All
            ? styles['photo-filter-tab-item-active']
            : styles['photo-filter-tab-item']
        }
      >
        {I18n.t('knowledge-dataset-type-all')}
      </div>
      <Divider layout="vertical" margin="12px" />
      <div
        data-testid={KnowledgeE2e.ImageAnnotationAnnotationedTab}
        key={FilterPhotoType.HasCaption}
        onClick={() => setPhotoFilterValue(FilterPhotoType.HasCaption)}
        className={
          photoFilterValue === FilterPhotoType.HasCaption
            ? styles['photo-filter-tab-item-active']
            : styles['photo-filter-tab-item']
        }
      >
        {I18n.t('knowledge_photo_013')}
      </div>
      <Divider layout="vertical" margin="12px" />
      <div
        data-testid={KnowledgeE2e.ImageAnnotationUnAnnotationTab}
        key={FilterPhotoType.NoCaption}
        onClick={() => setPhotoFilterValue(FilterPhotoType.NoCaption)}
        className={
          photoFilterValue === FilterPhotoType.NoCaption
            ? styles['photo-filter-tab-item-active']
            : styles['photo-filter-tab-item']
        }
      >
        {I18n.t('knowledge_photo_014')}
      </div>
    </div>
  );
};
