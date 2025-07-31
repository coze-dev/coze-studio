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

import React, {
  Suspense,
  lazy,
  type PropsWithChildren,
  type ReactNode,
  type CSSProperties,
} from 'react';

import classNames from 'classnames';

import s from './index.module.less';
// React-markdown longtask around 20ms
const LazyReactMarkdown = lazy(() => import('react-markdown'));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactMarkdown = (props: any) => (
  <Suspense fallback={null}>
    <LazyReactMarkdown {...props} />
  </Suspense>
);
export const PopoverContent: React.FC<
  PropsWithChildren & {
    text?: string;
    node?: ReactNode;
    className?: string;
    style?: CSSProperties;
  }
> = ({ children, className, style }) => (
  <div className={classNames(s['tip-content'], className)} style={style}>
    {typeof children === 'string' ? (
      <ReactMarkdown skipHtml={true} className={s.markdown}>
        {children}
      </ReactMarkdown>
    ) : (
      children
    )}
  </div>
);
