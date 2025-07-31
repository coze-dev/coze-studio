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

import classNames from 'classnames';

import s from './index.module.less';

const Container = (props: {
  className?: string;
  children?: React.ReactNode;
  shadowMode?: 'default' | 'primary';
  onClick?: () => void;
}) => {
  const { className, children, onClick, shadowMode } = props;

  return (
    <div
      className={classNames(
        'coz-bg-max',
        s.container,
        s.width100,
        className,
        s[`shadow-${shadowMode}`],
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const SkeletonContainer = (props: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={classNames(
      'coz-mg-primary',
      s.container,
      s.width100,
      s.skeleton,
      props.className,
    )}
  >
    {props?.children}
  </div>
);

export const CardContainer = Container;
export const CardSkeletonContainer = SkeletonContainer;
