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

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozCross, IconCozTrashCan } from '@coze-arch/coze-design/icons';
import {
  Button,
  Divider,
  IconButton,
  Typography,
} from '@coze-arch/coze-design';

export interface BatchDeleteToolbarProps {
  selectedCount?: number;
  onDelete: () => void;
  onCancel: () => void;
}

export function BatchDeleteToolbar({
  selectedCount = 0,
  onDelete,
  onCancel,
}: BatchDeleteToolbarProps) {
  return (
    <div
      className={classNames(
        'flex items-center p-[8px] gap-[8px] rounded-[12px]',
        'coz-bg-max border-solid coz-stroke-primary coz-shadow-default',
        'fixed bottom-[8px] left-[50%] translate-x-[-50%] z-10',
        { hidden: selectedCount <= 0 },
      )}
    >
      <Typography.Text type="secondary">
        {I18n.t('db_optimize_031', { n: selectedCount })}
      </Typography.Text>
      <Divider layout="vertical" />
      <Button color="red" icon={<IconCozTrashCan />} onClick={onDelete}>
        {I18n.t('db_optimize_030')}
      </Button>
      <Divider layout="vertical" />
      <IconButton
        color="secondary"
        icon={<IconCozCross />}
        onClick={onCancel}
      />
    </div>
  );
}
