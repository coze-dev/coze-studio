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

import { get } from 'lodash-es';
import { useWorkflowNode } from '@coze-workflow/base';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';

import { Field, OverflowTagList } from '../../fields';
import { Icon } from './icon';
import thumbnail7 from './assets/reference-7.png';
import thumbnail6 from './assets/reference-6.jpg';
import thumbnail5 from './assets/reference-5.jpg';
import thumbnail4 from './assets/reference-4.jpg';
import thumbnail3 from './assets/reference-3.jpg';
import thumbnail2 from './assets/reference-2.jpg';
import thumbnail1 from './assets/reference-1.jpg';

const thumbnails = [
  thumbnail1,
  thumbnail2,
  thumbnail3,
  thumbnail4,
  thumbnail5,
  thumbnail6,
  thumbnail7,
];

export function References() {
  const { data } = useWorkflowNode();

  const references = (
    get(data, 'references') || get(data, 'inputs.references')
  )?.filter(({ preprocessor }) => preprocessor !== undefined);

  return (
    <Field
      contentClassName="flex gap-[6px]"
      label={I18n.t('Imageflow_reference_image')}
      isEmpty={!references || references.length === 0}
    >
      <OverflowTagList
        value={references?.map(({ preprocessor }) => ({
          label: I18n.t(
            `Imageflow_reference${preprocessor}` as I18nKeysNoOptionsType,
          ),
          icon: <Icon src={thumbnails[preprocessor - 1]} />,
        }))}
      />
    </Field>
  );
}
