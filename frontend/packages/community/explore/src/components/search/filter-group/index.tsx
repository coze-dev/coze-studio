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

import React from 'react';

import cls from 'classnames';
import { IconCozCheckMarkFill } from '@coze-arch/coze-design/icons';
import { Button, Typography } from '@coze-arch/coze-design';
import { Space, Spin } from '@coze-arch/bot-semi';

import styles from './index.module.less';

const { Text } = Typography;
interface FilterGroupradioProps {
  title: string;
  radioList: { value: number | string; text: string }[];
  onClick?: (num: number | string) => void;
  onChange?: (num: number | string) => void;
  value?: string | number;
}

export const Divider = () => <div className={styles.divider} />;

export const FilterGroupRadio = (props: FilterGroupradioProps) => {
  const { title, radioList, onClick, value, onChange } = props;
  return (
    <Space spacing={8} vertical className={styles['filter-group']}>
      <Typography.Text className={styles['filter-titile']}>
        {title}
      </Typography.Text>
      <Space vertical spacing={8} className={styles['filter-content']}>
        {radioList.length > 0 ? (
          radioList.map(item => (
            <Button
              color="primary"
              size="small"
              key={item.value}
              className={cls(styles['radio-btn'], {
                [styles.active]: value === item?.value,
              })}
              onClick={() => {
                onClick?.(item?.value);
                if (value !== item?.value) {
                  onChange?.(item?.value);
                }
              }}
            >
              <Text
                ellipsis={{
                  rows: 1,
                }}
                className={styles['radio-btn-text']}
              >
                {item.text}
              </Text>
            </Button>
          ))
        ) : (
          <Spin />
        )}
      </Space>
    </Space>
  );
};

interface FilterGroupCheckboxProps {
  title: string;
  checkList: { value: number | string; text: string }[];
  onClick?: (num: (number | string)[]) => void;
  value?: (string | number)[];
}

export const FilterGroupCheckbox = (props: FilterGroupCheckboxProps) => {
  const { title, checkList, onClick, value } = props;
  const formatValue = value || [];
  return (
    <Space spacing={8} vertical className={styles['filter-group']}>
      <Typography.Text className={styles['filter-titile']}>
        {title}
      </Typography.Text>
      <Space vertical spacing={8} className={styles['filter-content']}>
        {checkList.length > 0 ? (
          checkList.map(item => {
            const isChecked = formatValue.includes(item?.value);
            return (
              <Button
                color="primary"
                size="small"
                key={item.value}
                icon={
                  <Space className={styles['checkbox-icon']}>
                    <IconCozCheckMarkFill width={'14'} height={'14'} />
                  </Space>
                }
                className={cls(styles['checkbox-btn'], {
                  [styles.active]: isChecked,
                })}
                onClick={() => {
                  let leftValue = formatValue.filter(
                    val => val !== item?.value,
                  );
                  if (leftValue.length === formatValue.length) {
                    leftValue = [...leftValue, item?.value];
                  }
                  onClick?.(leftValue);
                }}
              >
                <Text
                  ellipsis={{
                    rows: 1,
                  }}
                  className={styles['checkbox-btn-text']}
                >
                  {item.text}
                </Text>
              </Button>
            );
          })
        ) : (
          <Spin style={{ marginTop: 10 }} />
        )}
      </Space>
    </Space>
  );
};
