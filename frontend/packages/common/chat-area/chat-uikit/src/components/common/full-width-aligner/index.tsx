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

import type { PropsWithChildren } from 'react';

import classNames from 'classnames';
import './index.less';

/**
 * Sleeve component, the default width bar, is used to help the isolated component maintain width alignment with the message box
 */
export const FullWidthAligner = (
  props: PropsWithChildren<{
    alignWidth?: string;
    className?: string;
    innerWrapClassName?: string;
  }>,
) => {
  const { alignWidth, children, className, innerWrapClassName } = props;
  return (
    <div
      className={classNames('full-width-aligner', className)}
      style={{
        width: alignWidth || '100%',
      }}
    >
      <span
        className={classNames(
          'full-width-aligner-inner-wrap',
          innerWrapClassName,
        )}
      >
        {children}
      </span>
    </div>
  );
};

FullWidthAligner.displayName = 'UIKitFullWidthAligner';
