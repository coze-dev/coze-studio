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

import { Button, Tag, Popover, Avatar } from '@coze-arch/coze-design';
import { IconInfo } from '@coze-arch/bot-icons';
import { type ModelDescGroup } from '@coze-arch/bot-api/developer_api';

import { ModelDescription } from './model-description';

import styles from './index.module.less';

export interface OptionItemProps {
  tokenLimit: number | undefined;
  descriptionGroupList: ModelDescGroup[] | undefined;
  avatar: string | undefined;
  name: string | undefined;
}

/** @Deprecated is not used, import {ModelOptionItem} from '@code-studio/components' is used; */
export const OptionItem: React.FC<OptionItemProps> = ({
  avatar,
  descriptionGroupList,
  tokenLimit = 0,
  name,
}) => (
  <div className={styles['label-content']}>
    <div
      className={styles['model-content']}
      data-testid="bot.ide.bot_creator.select_model_formitem"
    >
      <Avatar
        shape="square"
        src={avatar}
        className={styles['model-content-icon']}
        data-testid="bot-detail.model-config-modal.model-avatar"
      />
      <span
        className={styles['model-name']}
        data-testid="bot-detail.model-config-modal.model-name"
      >
        <span>{name}</span>
      </span>
      <Tag
        prefixIcon={null}
        color="primary"
        className={styles['model-token']}
        data-testid="bot-detail.model-config-modal.model-token-tag"
      >
        {(tokenLimit / 1024).toFixed(0)}K
      </Tag>
    </div>
    {descriptionGroupList?.length ? (
      <Popover
        trigger="hover"
        // Add a delay to prevent accidental touch
        mouseEnterDelay={1000 * 0.3}
        className={'max-w-[224px] px-[12px] py-[8px]'}
        content={
          <ModelDescription
            descriptionGroupList={descriptionGroupList}
            data-testid="bot-detail.model-config-modal-model.description-popover"
          />
        }
      >
        <Button
          color="secondary"
          icon={<IconInfo />}
          data-testid="bot-detail.model-config-modal.model-info-button"
        />
      </Popover>
    ) : null}
  </div>
);
