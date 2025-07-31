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

import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';

import thumbnail8 from '../../assets/8.png';
import thumbnail7 from '../../assets/7.jpg';
import thumbnail6 from '../../assets/6.jpg';
import thumbnail5 from '../../assets/5.jpg';
import thumbnail4 from '../../assets/4.jpg';
import thumbnail3 from '../../assets/3.jpg';
import thumbnail2 from '../../assets/2.jpg';
import thumbnail1 from '../../assets/1.jpg';

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

export function createModelOptions() {
  let models = [1, 8, 2, 3, 4, 5, 6, 7];

  if (IS_OVERSEA) {
    models = models.filter(model => ![6].includes(model));
  }

  return models.map(model => ({
    label: I18n.t(`Imageflow_model${model}` as I18nKeysNoOptionsType),
    value: model,
    thumbnail: thumbnails[model - 1],
  }));
}
