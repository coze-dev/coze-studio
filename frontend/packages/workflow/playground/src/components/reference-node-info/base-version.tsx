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
import {
  IconCozInfoCircle,
  IconCozWarningCircleFill,
} from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

import css from './base-version.module.less';

interface BaseVersionInfoProps {
  versionName?: string;
}

export const BaseVersionInfo: React.FC<BaseVersionInfoProps> = ({
  versionName,
}) => (
  <Tooltip content={versionName}>
    <IconButton
      icon={<IconCozInfoCircle />}
      size="mini"
      color="secondary"
      wrapperClass={css['base-version-icon']}
    />
  </Tooltip>
);

interface OutDatedVersionInfoProps {
  versionName?: string;
  onUpdate: () => void;
}

export const OutDatedVersionInfo: React.FC<OutDatedVersionInfoProps> = ({
  versionName,
  onUpdate,
}) => (
  <Tooltip
    content={
      <>
        {versionName}
        <br />
        {I18n.t('workflow_version_update_tag_tooltips')}
      </>
    }
  >
    <IconButton
      icon={<IconCozWarningCircleFill className="coz-fg-hglt-yellow" />}
      onClick={onUpdate}
      size="mini"
      color="secondary"
      wrapperClass={css['base-version-icon']}
    />
  </Tooltip>
);
