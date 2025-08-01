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

import { type MouseEvent, type CSSProperties } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Tooltip, Typography } from '@coze-arch/bot-semi';
import {
  IconDeleteOutline,
  IconEdit,
  IconWarningInfo,
} from '@coze-arch/bot-icons';

import { type TestsetData } from '../../types';

import s from './testset-option-item.module.less';

interface TestsetOptionItemProps {
  className?: string;
  data: TestsetData;
  /** Have editing permission */
  editable?: boolean;
  onEdit?: (data: TestsetData) => void;
  onDelete?: (data: TestsetData) => void;
}

const { Text } = Typography;

/** multi-line text display optimization */
const MULTILINE_TOOLTIP_STYLE: CSSProperties = { wordBreak: 'break-word' };

export function TestsetOptionItem({
  data,
  editable,
  className,
  onEdit,
  onDelete,
}: TestsetOptionItemProps) {
  const incompatible = data.schemaIncompatible;
  const testsetName = data.caseBase?.name ?? '-';

  const onOptionClick = (evt: MouseEvent<HTMLDivElement>) => {
    // Bubbling needs to be prevented when incompatible
    if (incompatible) {
      evt.preventDefault();
      evt.stopPropagation();
    }
  };

  const onEditAction = () => {
    onEdit?.(data);
  };

  const onDeleteAction = () => {
    onDelete?.(data);
  };

  const renderContent = () => (
    <>
      <div className={s.text} onClick={onOptionClick}>
        <Text
          className={cls(s.name, incompatible && s.incompatible)}
          ellipsis={{
            showTooltip: incompatible
              ? false
              : {
                  opts: {
                    position: 'left',
                    spacing: 48,
                    content: testsetName,
                    style: MULTILINE_TOOLTIP_STYLE,
                  },
                },
          }}
        >
          {testsetName}
        </Text>
      </div>
      {editable ? (
        <div className={s.action}>
          <div role="button" className={s['action-btn']} onClick={onEditAction}>
            <IconEdit />
          </div>
          <div
            role="button"
            className={s['action-btn']}
            onClick={onDeleteAction}
          >
            <IconDeleteOutline />
          </div>
        </div>
      ) : null}
    </>
  );

  return incompatible ? (
    <Tooltip
      position="left"
      spacing={48}
      content={I18n.t('workflow_testset_invalid_tip', { testsetName })}
    >
      <div className={cls(s.container, className)}>
        <IconWarningInfo className={s.warning} />
        {renderContent()}
      </div>
    </Tooltip>
  ) : (
    <div className={cls(s.container, className)}>{renderContent()}</div>
  );
}

/** Selected backfill */
export function SelectedTestsetOptionItem({
  data,
  className,
}: Pick<TestsetOptionItemProps, 'data' | 'className'>) {
  const testsetName = data.caseBase?.name || '';
  const incompatible = data.schemaIncompatible;
  const invalidTip = incompatible
    ? I18n.t('workflow_testset_invaild_tip', { testset_name: testsetName })
    : undefined;

  const renderContent = () => (
    <div className={cls(s.selected, className)}>
      {incompatible ? <IconWarningInfo className={s.warning} /> : null}
      <div className={s.text}>
        <Text
          className={cls(s.name, incompatible && s.incompatible)}
          ellipsis={{
            showTooltip: incompatible
              ? false
              : {
                  opts: {
                    content: data.caseBase?.name,
                    style: MULTILINE_TOOLTIP_STYLE,
                  },
                },
          }}
        >
          {testsetName}
        </Text>
      </div>
    </div>
  );

  return incompatible ? (
    <Tooltip
      content={invalidTip}
      style={MULTILINE_TOOLTIP_STYLE}
      clickToHide={true}
    >
      {renderContent()}
    </Tooltip>
  ) : (
    renderContent()
  );
}
