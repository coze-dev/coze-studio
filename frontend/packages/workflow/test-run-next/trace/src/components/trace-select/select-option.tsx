import { useMemo } from 'react';

import { gotoDebugFlow } from '@coze-workflow/test-run-shared';
import { I18n } from '@coze-arch/i18n';
import { type Span } from '@coze-arch/bot-api/workflow_api';
import { IconCozExit } from '@coze/coze-design/icons';
import {
  Typography,
  Tag,
  IconButton,
  type ButtonProps,
} from '@coze/coze-design';

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
