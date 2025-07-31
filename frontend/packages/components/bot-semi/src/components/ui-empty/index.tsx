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

import React, { ReactElement } from 'react';

import classNames from 'classnames';
import { Empty } from '@douyinfe/semi-ui';
import {
  IllustrationNoContent,
  IllustrationNoContentDark,
  IllustrationNoResult,
  IllustrationNoResultDark,
} from '@douyinfe/semi-illustrations';

import { Button } from '../../components/ui-button';

import s from './index.module.less';

export interface EmptyProps {
  title?: string;
  icon?: ReactElement;
  iconDarkMode?: ReactElement;
  description?: string;
  btnText?: string;
  loading?: boolean;
  btnOnClick?: () => void;
}

export interface UIEmptyProps {
  className?: string;
  isNotFound?: boolean;
  empty?: EmptyProps;
  notFound?: EmptyProps;
}

enum EmptyButtonOpacity {
  Disable = 0.6,
  UnDisable = 1,
}

export function UIEmpty({
  className,
  isNotFound = false,
  empty,
  notFound,
}: UIEmptyProps) {
  return (
    <div className={classNames(s['ui-empty'], className)}>
      {isNotFound ? (
        <Empty
          title={notFound?.title}
          image={
            notFound?.icon ? (
              notFound.icon
            ) : (
              <IllustrationNoResult style={{ width: 150, height: '100%' }} />
            )
          }
          darkModeImage={
            notFound?.iconDarkMode ? (
              notFound.iconDarkMode
            ) : (
              <IllustrationNoResultDark
                style={{ width: 150, height: '100%' }}
              />
            )
          }
        ></Empty>
      ) : (
        <Empty
          title={empty?.title}
          description={empty?.description || ''}
          image={
            empty?.icon ? (
              empty.icon
            ) : (
              <IllustrationNoContent style={{ width: 150, height: '100%' }} />
            )
          }
          darkModeImage={
            empty?.iconDarkMode ? (
              empty.iconDarkMode
            ) : (
              <IllustrationNoContentDark
                style={{ width: 150, height: '100%' }}
              />
            )
          }
        >
          {!!empty?.btnText && (
            <Button
              theme="solid"
              onClick={empty?.btnOnClick}
              loading={empty?.loading}
              style={{
                opacity: empty?.loading
                  ? EmptyButtonOpacity.Disable
                  : EmptyButtonOpacity.UnDisable,
              }}
            >
              {empty.btnText}
            </Button>
          )}
        </Empty>
      )}
    </div>
  );
}

// Native usage in non-graphic scenarios
UIEmpty.Semi = Empty;

export default UIEmpty;
