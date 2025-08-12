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

import React, { useContext, type FC } from 'react';

import classNames from 'classnames';
import {
  PARAM_TYPE_LABEL_MAP,
  STRING_ASSIST_TYPE_LABEL_MAP,
} from '@coze-workflow/base/types';
import { InputType, PluginParamTypeFormat } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';
import { Tag, Typography } from '@coze-arch/coze-design';
import { type OverflowListProps } from '@coze-arch/bot-semi/OverflowList';
import { Popover, OverflowList } from '@coze-arch/bot-semi';

import WorkflowModalContext from '../../../workflow-modal-context';
import {
  DataSourceType,
  type ProductInfo,
  type WorkflowInfo,
} from '../../../type';
import { type WorkflowCardProps } from '../../../hooks/use-workflow-action';

import styles from './index.module.less';

const { Paragraph, Text } = Typography;

const getInputType = ({ type, format, assist_type }) => {
  let inputType = '';
  if (type) {
    if (
      type === InputType.String &&
      format === PluginParamTypeFormat.ImageUrl
    ) {
      inputType = 'Image';
    } else if (type === InputType.String && assist_type) {
      inputType = STRING_ASSIST_TYPE_LABEL_MAP[assist_type];
    } else {
      inputType = PARAM_TYPE_LABEL_MAP[type as InputType];
    }
  }

  return inputType;
};

export interface WorkflowParameterItem {
  name?: string;
  desc?: string;
  required?: boolean;
  type?: string;
}

type WorkflowParametersProps = Pick<WorkflowCardProps, 'data'> & {
  className?: string;
  style?: React.CSSProperties;
};

interface CustomParameterPopoverProps {
  items: WorkflowParameterItem[];
  children: React.ReactNode;
}

const CustomParameterPopover: FC<CustomParameterPopoverProps> = ({
  children,
  items,
}) => (
  <Popover
    stopPropagation
    position="top"
    spacing={0}
    content={
      <div className={styles.popover}>
        {items.map((item, index) => (
          <div key={`item${index}`} className={styles.item}>
            <div className={styles.header}>
              <Text
                ellipsis={{
                  showTooltip: {
                    opts: {
                      content: item.name || '',
                      position: 'top',
                      style: {
                        wordBreak: 'break-word',
                      },
                    },
                  },
                }}
              >
                <span className={styles.name}>{item.name || '-'}</span>
              </Text>
              <span className={styles.type}>{item.type || '-'}</span>
              {Boolean(item.required) && (
                <span className={styles.required}>
                  {I18n.t('workflow_add_parameter_required')}
                </span>
              )}
            </div>
            <div className={styles.footer}>
              <Paragraph
                ellipsis={{
                  rows: 2,
                  showTooltip: {
                    opts: {
                      content: item.desc || '',
                      position: 'top',
                      style: {
                        wordBreak: 'break-word',
                      },
                    },
                  },
                }}
              >
                <span className={styles.footer}>{item.desc || '-'}</span>
              </Paragraph>
            </div>
          </div>
        ))}
      </div>
    }
  >
    {children}
  </Popover>
);

export const WorkflowParameters: FC<WorkflowParametersProps> = ({
  data,
  style,
  className,
}) => {
  const context = useContext(WorkflowModalContext);
  function isTypeWorkflow(
    target: WorkflowInfo | ProductInfo,
  ): target is WorkflowInfo {
    return context?.modalState.dataSourceType === DataSourceType.Workflow;
  }
  const getParameters = (): Array<WorkflowParameterItem> => {
    // Although this split is a bit redundant, it allows for correct type derivation
    if (isTypeWorkflow(data)) {
      return (
        data.start_node?.node_param?.input_parameters?.map(item => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const inputType = getInputType(item as any);

          return {
            name: item.name,
            desc: item.desc,
            required: item.required,
            type: inputType,
          };
        }) || []
      );
    }

    return (
      data?.workflow_extra?.start_node?.node_param?.input_parameters?.map(
        item => {
          const inputType = getInputType({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(item as any),
            type: item.input_type,
          });

          return {
            name: item.name,
            desc: item.desc,
            required: item.is_required,
            type: inputType,
          };
        },
      ) || []
    );
  };

  const items = getParameters();

  const overflowRenderer: OverflowListProps['overflowRenderer'] = (
    overflowItems: Array<WorkflowParameterItem>,
  ) => {
    const slicedItems = overflowItems.slice(overflowItems.length * -1);
    return slicedItems.length ? (
      <CustomParameterPopover items={items}>
        <div>
          <Tag style={{ flex: '0 0 auto' }} size="mini" color="primary">
            +{slicedItems.length}
          </Tag>
        </div>
      </CustomParameterPopover>
    ) : null;
  };
  const visibleItemRenderer: OverflowListProps['visibleItemRenderer'] = (
    item: WorkflowParameterItem,
  ) => (
    <CustomParameterPopover items={items}>
      <div style={{ marginRight: 8 }}>
        <Tag size="mini" color="primary">
          {item.name}
        </Tag>
      </div>
    </CustomParameterPopover>
  );

  return (
    <div className={classNames(styles.container, className)} style={style}>
      <div className={styles.wrapper}>
        <OverflowList
          items={items}
          overflowRenderer={overflowRenderer}
          visibleItemRenderer={visibleItemRenderer}
        />
      </div>
    </div>
  );
};
