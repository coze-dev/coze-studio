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

import React, { type FC, useMemo } from 'react';

import { I18n } from '@coze-arch/i18n';
import { ProjectResourceGroupType } from '@coze-arch/bot-api/plugin_develop';

import styles from './styles.module.less';
export interface EmptyProps {
  type: ProjectResourceGroupType;
}

export const Empty: FC<EmptyProps> = ({ type }) => {
  const title = useMemo(() => {
    switch (type) {
      case ProjectResourceGroupType.Workflow:
        return I18n.t('project_resource_sidebar_resource_not_added', {
          resource: I18n.t('library_resource_type_workflow'),
        });
      case ProjectResourceGroupType.Plugin:
        return I18n.t('project_resource_sidebar_resource_not_added', {
          resource: I18n.t('library_resource_type_plugin'),
        });
      case ProjectResourceGroupType.Data:
        return I18n.t('project_resource_sidebar_resource_not_added', {
          resource: I18n.t('project_resource_sidebar_data_section'),
        });
      default:
        return '';
    }
  }, [type]);
  return (
    <div className={styles.empty}>
      <div className={styles['empty-card']}>
        <div className={styles['empty-icon']} />
        <div className={styles['empty-skeleton']}>
          <span />
          <span />
        </div>
      </div>
      <div className={styles['empty-title']}>{title}</div>
    </div>
  );
};
