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

import React from 'react';

import dayjs from 'dayjs';
import {
  type IntelligenceBasicInfo,
  type IntelligencePublishInfo,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { useSpace } from '@coze-arch/foundation-sdk';
import { IconCozCheckMarkCircleFillPalette } from '@coze-arch/coze-design/icons';
import { CozAvatar, Tag } from '@coze-arch/coze-design';
import { type User } from '@coze-arch/bot-api/intelligence_api';

import styles from './styles.module.less';

const formatTime = (time?: string) => {
  const timeNumber = Number(time);
  if (isNaN(timeNumber)) {
    return '-';
  }
  return dayjs.unix(timeNumber).format('YYYY-MM-DD HH:mm:ss');
};

export const InfoContent = ({
  spaceId,
  projectInfo,
  publishInfo,
  ownerInfo,
}: {
  spaceId: string;
  projectInfo?: IntelligenceBasicInfo;
  publishInfo?: IntelligencePublishInfo;
  ownerInfo?: User;
}) => {
  const space = useSpace(spaceId);

  if (!projectInfo) {
    return null;
  }
  const createTime = formatTime(projectInfo?.create_time);

  return (
    <div className={styles.content}>
      <CozAvatar type="bot" size="xl" src={projectInfo?.icon_url} />
      <div className={styles.title}>{projectInfo?.name}</div>
      <div className={styles.description}>{projectInfo?.description}</div>
      <div className={styles['tag-container']}>
        {space ? (
          <Tag
            className={styles.tag}
            color="primary"
            prefixIcon={<CozAvatar size="mini" src={space.icon_url} />}
          >
            {space.name}
          </Tag>
        ) : null}
        {publishInfo?.has_published ? (
          <Tag
            className={styles.tag}
            color="green"
            prefixIcon={<IconCozCheckMarkCircleFillPalette />}
          >
            {I18n.t('Published_1')}
          </Tag>
        ) : null}
      </div>
      {ownerInfo ? (
        <div className={styles['owner-container']}>
          <CozAvatar size="micro" src={ownerInfo?.avatar_url} />
          <div>{ownerInfo?.nickname}</div>
          <div>@{ownerInfo?.user_unique_name}</div>
        </div>
      ) : null}
      <div className={styles.time}>
        {I18n.t('project_ide_info_created_on', {
          time: createTime,
        })}
      </div>
    </div>
  );
};
