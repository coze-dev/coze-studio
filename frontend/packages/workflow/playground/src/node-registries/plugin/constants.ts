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

import { I18n } from '@coze-arch/i18n';

export const INPUTS_PATH = 'inputs';
export const OUTPUTS_PATH = 'outputs';

export const API_PARAMS_KEY = 'apiParam';
export const INPUT_PARAMS_KEY = 'inputParameters';
export const BATCH_INPUTS_LIST_KEY = 'inputLists';

export const INPUT_PARAMS_PATH = `${INPUTS_PATH}.${INPUT_PARAMS_KEY}`;
export const API_PARAMS_PATH = `${INPUTS_PATH}.${API_PARAMS_KEY}`;
export const BATCH_MODE_KEY = 'batchMode';
export const BATCH_MODE_PATH = `${INPUTS_PATH}.${BATCH_MODE_KEY}`;

export const BATCH_KEY = 'batch';
export const BATCH_PATH = `${INPUTS_PATH}.${BATCH_KEY}`;
export const BATCH_INPUT_LIST_PATH = `${BATCH_PATH}.${BATCH_INPUTS_LIST_KEY}`;

export const COLUMNS = [
  {
    label: I18n.t('workflow_detail_node_parameter_name'),
    style: { width: 148 },
  },
  { label: I18n.t('workflow_detail_end_output_value') },
];

export const NOT_FREE_PLUGINS_APINAME_DOC_MAP = {
  add_text_to_image: '/open/docs/guides/add_text_to_image_plugin',
  sd_better_prompt: '/open/docs/guides/better_prompt_plugin',
  cut_image: '/open/docs/guides/cut_image_plugin',
  add_image_to_image: '/open/docs/guides/add_image_to_image_plugin',
  resize: '/open/docs/guides/resize_image_plugin',
  image_rotate: '/open/docs/guides/rotate_image_plugin',
  FacePretty: '/open/docs/guides/facepretty_plugin',
  change: '/open/docs/guides/change_image_plugin',
  text2image: '/open/docs/guides/byteartist_plugin',
  background_change: '/open/docs/guides/change_background_plugin',
  spring_pets_image: '/open/docs/guides/pet_image_plugin',
  gen_image: '/open/docs/guides/doubao_image_plugin',
  style_transfer: '/open/docs/guides/style_transfer_plugin',
  light: '/open/docs/guides/light_plugin',
  image_quality_improve: '/open/docs/guides/improve_image_quality_plugin',
  image_change: '/open/docs/guides/instruction_editing_plugin',
  swap_face: '/open/docs/guides/swap_face_plugin',
  cutout: '/open/docs/guides/cutout_plugin',
  intelligentImageExpansion:
    '/open/docs/guides/intelligent_image_expansion_plugin',
  gen_song: '/open/docs/guides/doubao_song_plugin',
};
