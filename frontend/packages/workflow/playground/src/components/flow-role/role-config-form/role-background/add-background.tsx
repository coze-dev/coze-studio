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

import { useState } from 'react';

import {
  useField,
  observer,
  type ObjectField,
} from '@coze-workflow/test-run/formily';
import { type BackgroundImageInfo } from '@coze-arch/bot-api/workflow_api';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { BackgroundModal } from './background-upload';

export const AddBackground: React.FC = observer(() => {
  const [visible, setVisible] = useState(false);
  const field = useField<ObjectField>();
  const { value, disabled } = field;

  const handleChange = (v: BackgroundImageInfo) => {
    field.setValue(v);
  };

  if (value?.web_background_image?.origin_image_url) {
    return null;
  }

  return (
    <>
      <IconButton
        color="secondary"
        size="small"
        disabled={disabled}
        icon={<IconCozPlus />}
        onClick={() => setVisible(true)}
      />
      <BackgroundModal
        visible={visible}
        value={value}
        onCancel={() => setVisible(false)}
        onChange={handleChange}
      />
    </>
  );
});
