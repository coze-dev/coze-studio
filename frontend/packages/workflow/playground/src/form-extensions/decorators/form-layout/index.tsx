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

import {
  type FC,
  type ReactElement,
  useState,
  type CSSProperties,
} from 'react';

import classNames from 'classnames';
import {
  IconCozArrowDownFill,
  IconCozInfoCircle,
} from '@coze-arch/coze-design/icons';
import { Col, Row, Collapsible } from '@coze-arch/coze-design';
import { type DecoratorComponentProps } from '@flowgram-adapter/free-layout-editor';

import { FormCard } from '../../components/form-card';
import AutoSizeTooltip from '../../../ui-components/auto-size-tooltip';
import { chunkArray } from './utils';

import s from './index.module.less';

interface FormLayoutDecoratorOptions {
  cols?: number;
  direction?: 'horizontal' | 'vertical';
  gutter?: number;
  gridColumns?: { title: string; ratio: number; style?: CSSProperties }[];
  isSplit?: boolean;
  title?: string;
  tooltip?: string;
}

// TODO: Temporarily extract the real children in the format of rehaje React Node, and then develop with rehaje to solve the problem of children.
const extractRealChildFromRehajeReactNode = (propsChildren: ReactElement) => {
  const { children = [] } = propsChildren.props;
  const [, realChildren] = children;
  return realChildren ?? [];
};

/**
 * @Description Suitable for scenes where the number of children in Meta is greater than 1 and there are custom requirements for grid layout, you can refer to the writing method of variable nodes
 * @param props grid configuration imported parameters
 * @Returns custom grid layout node
 */
const FormLayoutDecorator: FC<DecoratorComponentProps> = props => {
  const { children, options } = props;
  const {
    cols = 2,
    gutter = 24,
    direction = 'horizontal',
    gridColumns,
    isSplit = true,
    tooltip,
    title,
  } = options as FormLayoutDecoratorOptions;
  const [isOpen, setOpen] = useState(true);

  if (direction === 'horizontal') {
    const realChildren = extractRealChildFromRehajeReactNode(children);
    const childrenChunk = chunkArray<ReactElement>(realChildren, cols);

    return (
      <div className={isSplit ? s['form-layout'] : ''}>
        <FormCard collapsible={false} noPadding>
          {typeof title === 'string' ? (
            <div className="mb-2" onClick={() => setOpen(!isOpen)}>
              <Row type="flex" align={'middle'}>
                <IconCozArrowDownFill
                  className={classNames('coz-fg-secondary font-bold mr-[3px]', {
                    [s['icon-arrow-row']]: isOpen,
                    [s['icon-arrow-column']]: true,
                  })}
                />

                <span className={`${s['form-layout-title']} ml-1`}>
                  {title}
                </span>
                {tooltip ? (
                  <AutoSizeTooltip
                    showArrow
                    position="top"
                    className={s.tooltip}
                    content={tooltip}
                  >
                    <IconCozInfoCircle className="text-lg coz-fg-secondary ml-1" />
                  </AutoSizeTooltip>
                ) : null}
              </Row>
            </div>
          ) : (
            ''
          )}

          <Collapsible keepDOM isOpen={isOpen}>
            {childrenChunk.map(subChildren => (
              <Row type="flex" gutter={gutter}>
                {subChildren.map((item, i) => {
                  const content = gridColumns?.[i];
                  return (
                    <Col
                      style={{
                        display: isOpen ? 'unset' : 'none',
                        ...content?.style,
                      }}
                      span={content?.ratio ?? gutter / cols}
                    >
                      {content ? (
                        <span className={s['form-layout-item']}>
                          {content?.title}
                        </span>
                      ) : (
                        ''
                      )}
                      {item}
                    </Col>
                  );
                })}
              </Row>
            ))}
          </Collapsible>
        </FormCard>
      </div>
    );
  }
  return <div>{children}</div>;
};

export const formLayout = {
  key: 'FormLayout',
  component: FormLayoutDecorator,
};
