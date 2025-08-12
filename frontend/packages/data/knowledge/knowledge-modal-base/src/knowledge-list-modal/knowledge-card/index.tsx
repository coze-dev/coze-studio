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

import copy from 'copy-to-clipboard';
import { useDataNavigate } from '@coze-data/knowledge-stores';
import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { UIIconButton, Typography, Toast, Avatar } from '@coze-arch/bot-semi';
import { CustomError } from '@coze-arch/bot-error';
import { type Dataset } from '@coze-arch/bot-api/knowledge';
import { IconCozCopy, IconCozMinusCircle } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';

import styles from './index.module.less';

export interface DataSetItemProps {
  dataSet: Dataset;
  isReadonly?: boolean;
  onRemove: () => void;
  onClick?: (datasetID: string) => void;
}

export const KnowledgeCard: React.FC<DataSetItemProps> = ({
  dataSet,
  isReadonly,
  onRemove,
  onClick,
}) => {
  const { name, description, icon_url, dataset_id: id } = dataSet;

  const resourceNavigate = useDataNavigate();

  const navigateToKnowledgePage = (): void => {
    resourceNavigate.toResource?.('knowledge', id);
  };

  const onCopy = (text: string) => {
    const res = copy(text);
    if (!res) {
      throw new CustomError(ReportEventNames.parmasValidation, 'empty copy');
    }
    Toast.success({
      content: I18n.t('copy_success'),
      showClose: false,
      id: 'dataset_copy_id',
    });
  };

  return (
    <div className={styles['data-set-item']}>
      <div
        className={styles['data-set-item-left']}
        onClick={() => {
          if (!id) {
            return;
          }
          onClick ? onClick(id) : navigateToKnowledgePage();
        }}
      >
        <Avatar shape="square" src={icon_url} className={styles['icon-note']} />
        <div className={styles['card-content']}>
          <Typography.Text
            className={styles['data-set-name']}
            ellipsis={{ showTooltip: true }}
          >
            {name}
          </Typography.Text>
          <Typography.Text
            className={styles['data-set-desc']}
            ellipsis={{ showTooltip: true }}
          >
            {description}
          </Typography.Text>
        </div>
      </div>
      <div className={styles['data-set-item-right']}>
        {!isReadonly && (
          <Tooltip content={I18n.t('Copy_name')}>
            <UIIconButton
              // wrapperClass={commonStyles['icon-button-16']}
              iconSize="small"
              icon={<IconCozCopy className={styles['icon-copy']} />}
              onClick={() => name && onCopy(name)}
            />
          </Tooltip>
        )}
        {!isReadonly && (
          <Tooltip content={I18n.t('remove_dataset')}>
            <UIIconButton
              // wrapperClass={commonStyles['icon-button-16']}
              iconSize="small"
              icon={<IconCozMinusCircle className={styles['icon-no']} />}
              onClick={onRemove}
            />
          </Tooltip>
        )}
      </div>
    </div>
  );
};
