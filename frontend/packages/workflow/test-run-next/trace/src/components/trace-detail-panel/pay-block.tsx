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

import { Divider, Typography } from '@coze-arch/coze-design';

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
