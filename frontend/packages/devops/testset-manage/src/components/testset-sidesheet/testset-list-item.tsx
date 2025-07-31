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

import { type MouseEvent, useState } from 'react';

import dayjs from 'dayjs';
import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Popconfirm, Tooltip, Typography, UIButton } from '@coze-arch/bot-semi';
import {
  IconDeleteOutline,
  IconEdit,
  IconWarningInfo,
  IconWaringRed,
} from '@coze-arch/bot-icons';

import { type TestsetData } from '../../types';

import s from './testset-list-item.module.less';

interface TestsetListItemProps {
  data: TestsetData;
  onEdit?: (data: TestsetData) => void;
  /** I clicked delete. */
  onClickDelete?: () => void;
  /** Confirm deletion */
  onDelete?: (data: TestsetData) => Promise<void>;
}

function formatTime(time: unknown) {
  const x = Number(time);

  return isNaN(x) ? '-' : dayjs.unix(x).format('YYYY.MM.DD HH:mm');
}

const { Text, Title, Paragraph } = Typography;

export function TestsetListItem({
  data,
  onEdit,
  onDelete,
}: TestsetListItemProps) {
  const testsetName = data.caseBase?.name ?? '-';
  const [deleting, setDeleting] = useState(false);
  const [pressing, setPressing] = useState(false);

  const onMouseDown = () => {
    setPressing(true);
  };

  const onMouseUp = () => {
    setPressing(false);
  };

  const onContainerClick = () => {
    onEdit?.(data);
  };

  const onClickEdit = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onEdit?.(data);
  };

  const onClickDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  };

  const onDeleteTestset = async () => {
    if (deleting) {
      return;
    }

    setDeleting(true);
    try {
      await onDelete?.(data);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={cls(s.container, pressing && s.pressing)}
      onClick={onContainerClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <div className="min-w-0 grow">
        <div className={s.title}>
          {data.schemaIncompatible ? (
            <Tooltip
              position="left"
              content={I18n.t('workflow_testset_invalid_tip', { testsetName })}
            >
              <IconWarningInfo className={s.warning} />
            </Tooltip>
          ) : null}
          <Title
            heading={6}
            ellipsis={{ showTooltip: true }}
            className="min-w-0 grow"
          >
            {testsetName}
          </Title>
        </div>
        <Paragraph
          size="small"
          ellipsis={{ showTooltip: true }}
          className={s.desc}
        >
          {data.caseBase?.description}
        </Paragraph>
        <Text size="small" className={s['editor-info']}>
          <img
            className={s['editor-info-avatar']}
            src={data.updater?.avatarUrl}
          />
          <Typography.Text
            className={s['editor-info-name']}
            ellipsis={{ rows: 1, showTooltip: true }}
          >
            {data.updater?.name}
          </Typography.Text>

          <span className={s['editor-info-separator']} />
          <span>
            {`${I18n.t('workflow_testset_edited')} ${formatTime(
              data.updateTimeInSec || data.createTimeInSec,
            )}`}
          </span>
        </Text>
      </div>
      <div className="ml-4 shrink-0">
        <UIButton
          theme="borderless"
          className={s.action}
          icon={<IconEdit />}
          onClick={onClickEdit}
        />
        <Popconfirm
          trigger="click"
          className={s.popconfirm}
          icon={<IconWaringRed />}
          title={I18n.t('workflow_testset_delete_title')}
          content={I18n.t('workflow_testset_delete_tip')}
          okText={I18n.t('workflow_testset_delete_confirm')}
          cancelText={I18n.t('workflow_testset_delete_cancel')}
          okType="danger"
          okButtonProps={{ loading: deleting }}
          onConfirm={onDeleteTestset}
        >
          <UIButton
            theme="borderless"
            className={s.action}
            icon={<IconDeleteOutline />}
            onClick={onClickDelete}
          />
        </Popconfirm>
      </div>
    </div>
  );
}
