import { type FC } from 'react';

import { Form, Tooltip, Typography } from '@coze-arch/bot-semi';
import { IconInfo } from '@coze-arch/bot-icons';

import style from './index.module.less';

export const LabelWithDescription: FC<{
  name: string;
  description?: string;
  required?: boolean;
}> = ({ name, description, required = true }) => (
  <div className="w-full flex items-center px-2 mb-[2px]">
    <Form.Label
      text={
        <Typography.Text
          ellipsis={{ showTooltip: true }}
          className={style.text}
        >
          {name}
        </Typography.Text>
      }
      required={required}
      className={style.label}
    />
    {!!description && (
      <Tooltip content={description}>
        <IconInfo className={style.icon} />
      </Tooltip>
    )}
  </div>
);
