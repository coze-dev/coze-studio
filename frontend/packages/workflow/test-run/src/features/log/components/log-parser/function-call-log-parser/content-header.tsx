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

import { type FC, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozCopy } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

import { useCopy } from '../../../hooks/use-copy';

export const ContentHeader: FC<
  PropsWithChildren<{
    source: unknown;
    className?: string;
  }>
> = ({ children, source, className }) => {
  const { handleCopy } = useCopy(source);

  return (
    <div className={classNames('flex items-center mb-1 h-4', className)}>
      <div className="font-medium coz-fg-secondary text-xs leading-4">
        {children}
      </div>
      <Tooltip content={I18n.t('workflow_250310_13')}>
        <div className="leading-none">
          <IconButton
            className="ml-0.5"
            wrapperClass="leading-[0px]"
            size="mini"
            icon={<IconCozCopy className="text-xs coz-fg-secondary" />}
            color="secondary"
            onClick={handleCopy}
          />
        </div>
      </Tooltip>
    </div>
  );
};
