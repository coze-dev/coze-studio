import { type FC } from 'react';

import { Typography } from '@coze/coze-design';

export interface NameProps {
  name?: string;
}

const Name: FC<NameProps> = ({ name }) => (
  <Typography.Text
    className="text-[16px] font-[500] leading-[22px]"
    ellipsis={{
      showTooltip: {
        opts: {
          content: <span onClick={e => e.stopPropagation()}>{name}</span>,
          style: { wordBreak: 'break-word' },
          theme: 'dark',
        },
        type: 'tooltip',
      },
      rows: 1,
    }}
  >
    {name}
  </Typography.Text>
);

export default Name;
