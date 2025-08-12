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

import React, { type PropsWithChildren, useRef } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { type PopoverProps } from '@coze-arch/bot-semi/Popover';
import { Tooltip, Popover, Row, Col } from '@coze-arch/bot-semi';

import s from './index.module.less';

interface SourceProps {
  token: string;
  cost: string;
}
interface ExpendProps {
  data: {
    output: SourceProps;
    input: SourceProps;
    total: SourceProps;
  };
  className?: string;
  popoverProps?: Partial<PopoverProps>;
}

export const CostPopover: React.FC<PropsWithChildren<ExpendProps>> = ({
  data,
  popoverProps,
  className,
  children,
}) => {
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} className={cls(s.container, className)}>
      <Popover
        showArrow
        getPopupContainer={() => containerRef.current ?? document.body}
        content={
          <div className={s.content}>
            <Row className={s.header}>
              <Col span={8}>{I18n.t('workflow_detail_title_source')}</Col>
              <Col span={10}>{I18n.t('workflow_detail_title_token')}</Col>
              {/* {FEATURE_ENABLE_WORKFLOW_LLM_PAYMENT && (
                <Col span={6}>{I18n.t('workflow_detail_title_cost')}</Col>
              )} */}
            </Row>
            <Row className={s.text} style={{ paddingBottom: 0 }}>
              <Col span={8} className={s.title}>
                {I18n.t('workflow_detail_node_output')}
              </Col>
              <Tooltip content={data.output.token}>
                <Col span={10} className={s.value}>
                  {data.output.token}
                </Col>
              </Tooltip>
              {/* {FEATURE_ENABLE_WORKFLOW_LLM_PAYMENT && (
                <Tooltip content={data.output.cost}>
                  <Col span={6} className={s.value}>
                    {data.output.cost}
                  </Col>
                </Tooltip>
              )} */}
            </Row>
            <Row className={s.text} style={{ paddingTop: 0 }}>
              <Col span={8} className={s.title}>
                {I18n.t('workflow_detail_node_parameter_input')}
              </Col>
              <Tooltip content={data.input.token}>
                <Col span={10} className={s.value}>
                  {data.input.token}
                </Col>
              </Tooltip>
              {/* {FEATURE_ENABLE_WORKFLOW_LLM_PAYMENT && (
                <Tooltip content={data.input.cost}>
                  <Col span={6} className={s.value}>
                    {data.input.cost}
                  </Col>
                </Tooltip>
              )} */}
            </Row>
            <Row className={s.footer}>
              <Col span={8} className={s.title}>
                {I18n.t('workflow_detail_title_total')}
              </Col>
              <Tooltip content={data.total.token}>
                <Col span={10} className={s.value}>
                  {data.total.token}
                </Col>
              </Tooltip>
              {/* {FEATURE_ENABLE_WORKFLOW_LLM_PAYMENT && (
                <Tooltip content={data.total.cost}>
                  <Col span={6} className={s.value}>
                    {data.total.cost}
                  </Col>
                </Tooltip>
              )} */}
            </Row>
          </div>
        }
        {...popoverProps}
      >
        {children}
      </Popover>
    </div>
  );
};
