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

import { useMemo } from 'react';

import { gotoDebugFlow } from '@coze-workflow/test-run-shared';
import { I18n } from '@coze-arch/i18n';
import { type Span } from '@coze-arch/bot-api/workflow_api';
import { IconCozExit } from '@coze-arch/coze-design/icons';
import {
  Typography,
  Tag,
  IconButton,
  type ButtonProps,
} from '@coze-arch/coze-design';

import { StatusIcon } from '../status-tag';
import {
  getTimeFromSpan,
  isTriggerFromSpan,
  getGotoNodeParams,
} from '../../utils';
import { useTraceListStore } from '../../contexts';

import css from './select-option.module.less';

interface SelectOptionProps {
  span: Span;
}

export const SelectOption: React.FC<SelectOptionProps> = ({ span }) => {
  const time = useMemo(() => getTimeFromSpan(span), [span]);
  const isTrigger = useMemo(() => isTriggerFromSpan(span), [span]);
  const { spaceId, isInOp } = useTraceListStore(store => ({
    spaceId: store.spaceId,
    isInOp: store.isInOp,
  }));
  const jumpToDebugFlow: ButtonProps['onClick'] = e => {
    e.stopPropagation();
    const params = getGotoNodeParams(span);
    gotoDebugFlow(
      {
        ...params,
        spaceId,
      },
      isInOp,
    );
  };

  return (
    <div className={css['select-option']}>
      <div className={css.title}>
        <StatusIcon status={span.status_code} className={css.icon} />
        <Typography.Text ellipsis={{ showTooltip: true }}>
          {time}
        </Typography.Text>
      </div>
      {isTrigger ? (
        <Tag
          style={{
            color: 'var(--coz-fg-hglt)',
            backgroundColor: 'var(--coz-mg-hglt)',
          }}
          size={'mini'}
        >
          {I18n.t('workflow_start_trigger_triggername')}
        </Tag>
      ) : null}
      <IconButton
        size="mini"
        icon={<IconCozExit />}
        onClick={jumpToDebugFlow}
      />
    </div>
  );
};
