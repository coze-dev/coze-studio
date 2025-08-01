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
import { IconCozRectangleMap } from '@coze-arch/coze-design/icons';
import { Tooltip, IconButton } from '@coze-arch/coze-design';

import type { ITool } from '../type';

export const MinimapSwitch = (props: ITool) => {
  const { handlers } = props;
  const { minimapVisible, setMinimapVisible } = handlers;

  return (
    <Tooltip content={I18n.t('workflow_toolbar_minimap_tooltips')}>
      <IconButton
        icon={
          <IconCozRectangleMap
            className={minimapVisible ? undefined : 'coz-fg-primary'}
          />
        }
        color={minimapVisible ? 'highlight' : 'secondary'}
        data-testid="workflow.detail.toolbar.minimap-switch"
        onClick={() => setMinimapVisible(!minimapVisible)}
      />
    </Tooltip>
  );
};
