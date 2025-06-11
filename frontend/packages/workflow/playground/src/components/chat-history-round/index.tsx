import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze/coze-design/icons';
import { Tooltip, CozInputNumber } from '@coze/coze-design';

export interface ChatHistoryRoundProps {
  value?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}

const MIN_ROUND = 1;
const MAX_ROUND = 30;

export const ChatHistoryRound = ({
  value,
  onChange,
  readonly,
}: ChatHistoryRoundProps) => (
  <div className="absolute right-[0] top-[9px] flex items-center gap-[4px]">
    <span className="text-xs">{I18n.t('wf_history_rounds')}</span>
    <Tooltip content={I18n.t('model_config_history_round_explain')}>
      <IconCozInfoCircle className="coz-fg-dim text-xs" />
    </Tooltip>

    <CozInputNumber
      className="w-[60px]"
      size="small"
      min={MIN_ROUND}
      max={MAX_ROUND}
      disabled={readonly}
      value={value}
      onChange={w => {
        if (isNaN(w as number)) {
          return;
        }
        onChange?.(w as number);
      }}
    />
  </div>
);
