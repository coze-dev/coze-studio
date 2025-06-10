import React from 'react';

import { type BackButtonProps } from '@coze-arch/foundation-sdk';
import { IconButton } from '@coze/coze-design';
import { IconArrowLeft } from '@coze-arch/bot-icons';

import s from './index.module.less';

export const BackButton = ({ onClickBack }: BackButtonProps) => (
  <div className={s['bot-exit-btn']}>
    <IconButton
      color="secondary"
      icon={<IconArrowLeft />}
      onClick={onClickBack}
      data-testid="bot-exit-button"
    />
  </div>
);
