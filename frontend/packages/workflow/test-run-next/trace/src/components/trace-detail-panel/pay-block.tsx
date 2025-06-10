import { Divider, Typography } from '@coze/coze-design';

import styles from './pay-block.module.less';

interface PayBlockProps {
  label: string;
  value: string;
}

export const PayBlock: React.FC<PayBlockProps> = ({ label, value }) => (
  <div className={styles['pay-block']}>
    <Typography.Text type="secondary" size="small">
      {label}:
    </Typography.Text>
    <Typography.Text strong size="small">
      {value}
    </Typography.Text>
  </div>
);

interface PayBlocksProps {
  options: PayBlockProps[];
}

export const PayBlocks: React.FC<PayBlocksProps> = ({ options }) => (
  <div className={styles['pay-blocks']}>
    {options.flatMap((item, idx) =>
      idx < options.length - 1
        ? [
            <PayBlock key={item.label} {...item} />,
            <Divider layout="vertical" margin={4} style={{ height: '10px' }} />,
          ]
        : [<PayBlock key={item.label} {...item} />],
    )}
  </div>
);
