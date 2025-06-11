import { type FC } from 'react';

import { Typography } from '@coze/coze-design';

export interface DescriptionProps {
  description?: string;
}

const Description: FC<DescriptionProps> = ({ description }) => (
  <Typography.Text
    className="coz-fg-secondary text-[14px] leading-[20px] break-words"
    ellipsis={{
      showTooltip: {
        opts: {
          theme: 'dark',
          content: (
            <Typography.Text
              className="break-words break-all coz-fg-white"
              onClick={e => e.stopPropagation()}
              ellipsis={{ showTooltip: false, rows: 16 }}
            >
              {description}
            </Typography.Text>
          ),
        },
        type: 'tooltip',
      },
      rows: 2,
    }}
  >
    {description}
  </Typography.Text>
);

export default Description;
