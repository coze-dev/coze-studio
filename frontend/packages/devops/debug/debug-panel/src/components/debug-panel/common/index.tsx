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

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { type TextProps } from '@coze-arch/bot-semi/Typography';
import { Typography } from '@coze-arch/bot-semi';
import { IconCopy } from '@coze-arch/bot-icons';
import { IconTick } from '@douyinfe/semi-icons';

import { textWithFallback } from '../../../utils';
import { type FieldCol } from '../../../typings';

import s from './index.module.less';

const { Text } = Typography;

interface DebugTextProps extends TextProps {
  text?: string;
  useCopy?: boolean;
}

export const DebugText = (props: DebugTextProps) => {
  const { text, useCopy, ...otherProps } = props;

  return (
    <div className={s['common-container']}>
      <Text
        ellipsis={{
          showTooltip: {
            opts: {
              className: s['common-text-content'],
              position: 'bottom',
            },
          },
        }}
        {...otherProps}
      >
        {textWithFallback(text)}
      </Text>
      {useCopy ? (
        <Text
          copyable={{
            icon: <IconCopy className={s['copy-icon']} />,
            successTip: <IconTick />,
            content: text,
            copyTip: I18n.t('query_detail_tip_copy'),
          }}
        />
      ) : undefined}
    </div>
  );
};

interface NodeDescriptionProps {
  cols: FieldCol[];
}

export const NodeDescription = (props: NodeDescriptionProps) => {
  const { cols } = props;

  return (
    <div className={s['description-container']}>
      {cols.map((col, colIndex) => {
        const { fields } = col;
        return (
          <div className={s['description-container-box']} key={colIndex}>
            {fields.map((field, fieldIndex) => {
              const { key, value, options } = field;
              return (
                <div
                  key={fieldIndex}
                  className={s['description-container-item']}
                >
                  <div className={s['description-container-item-key']}>
                    {key}&nbsp;:&nbsp;
                  </div>
                  <div className={s['description-container-item-value']}>
                    {value === undefined || typeof value === 'string' ? (
                      <DebugText
                        text={value}
                        useCopy={options?.copyable}
                        style={{ fontSize: 12 }}
                      />
                    ) : (
                      value
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

interface NodeDetailTitleProps {
  text: string;
  copyContent?: string;
  description?: string;
}

export const NodeDetailTitle = (props: NodeDetailTitleProps) => {
  const { text, copyContent, description } = props;

  return (
    <div className={s['node-detail-title']}>
      <Text
        className={classNames(s['node-detail-title-left'], s['common-text'])}
        copyable={
          copyContent
            ? {
                content: copyContent,
                icon: <IconCopy className={s['copy-icon']} />,
                successTip: <IconTick />,
                copyTip: I18n.t('query_detail_tip_copy'),
              }
            : false
        }
      >
        {text}
      </Text>
      {description ? (
        <div className={s['node-detail-title-right']}>{description}</div>
      ) : null}
    </div>
  );
};

export const NodeDescriptionWithFullLine = (props: NodeDescriptionProps) => {
  const { cols } = props;

  return (
    <div
      className={classNames(
        'gap-x-[18px] flex flex-wrap justify-between',
        s['description-container-with-full-line'],
      )}
    >
      {cols.map(item => {
        const { fields } = item;

        return (
          <>
            {fields.map((field, index) => {
              const { value, key, options } = field;
              return (
                <div
                  key={index}
                  className={classNames(
                    s['description-container-with-full-line-item'],
                    {
                      '!w-full': options?.fullLine,
                      'flex-1': !options?.fullLine,
                    },
                  )}
                >
                  <div
                    className={
                      s['description-container-with-full-line-item-key']
                    }
                  >
                    {key}&nbsp;:&nbsp;
                  </div>
                  <div
                    className={
                      s['description-container-with-full-line-item-value']
                    }
                  >
                    {value === undefined || typeof value === 'string' ? (
                      <DebugText
                        text={value}
                        useCopy={options?.copyable}
                        style={{ fontSize: 12 }}
                      />
                    ) : (
                      <>{value}</>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        );
      })}
    </div>
  );
};
