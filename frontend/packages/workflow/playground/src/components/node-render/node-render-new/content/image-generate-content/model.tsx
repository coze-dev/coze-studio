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
import thumbnail8 from './assets/8.png';
import thumbnail7 from './assets/7.jpg';
import thumbnail6 from './assets/6.jpg';
import thumbnail5 from './assets/5.jpg';
import thumbnail4 from './assets/4.jpg';
import thumbnail3 from './assets/3.jpg';
import thumbnail2 from './assets/2.jpg';
import thumbnail1 from './assets/1.jpg';

const thumbnails = [
  thumbnail1,
  thumbnail2,
  thumbnail3,
  thumbnail4,
  thumbnail5,
  thumbnail6,
  thumbnail7,
  thumbnail8,
];

export function Model() {
  const { data } = useWorkflowNode();
  // Component form field name supports point syntax. The new version generally starts from inputs. It needs to be compatible with the old version.
  const model =
    get(data, 'modelSetting.model') || get(data, 'inputs.modelSetting.model');

  return (
    <Field label={I18n.t('Imageflow_model')} isEmpty={!model}>
      <OverflowTagList
        value={[
          {
            label: I18n.t(`Imageflow_model${model}` as I18nKeysNoOptionsType),
            icon: <Icon src={thumbnails[model - 1]} />,
          },
        ]}
      />
    </Field>
  );
}
