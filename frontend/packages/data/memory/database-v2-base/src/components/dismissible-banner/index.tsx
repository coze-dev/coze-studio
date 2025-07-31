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

import { useState, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import {
  type BannerProps,
  IconButton,
  Typography,
} from '@coze-arch/coze-design';

export type BannerType = NonNullable<BannerProps['type']>;

const BannerClassNames: Record<BannerType, string> = {
  info: 'bg-[rgba(var(--coze-brand-1),var(--coze-brand-1-alpha))]',
  warning: 'bg-[rgba(var(--coze-yellow-1),var(--coze-yellow-1-alpha))]',
  danger: 'bg-[rgba(var(--coze-red-1),var(--coze-red-1-alpha))]',
  success: 'bg-[rgba(var(--coze-green-1),var(--coze-green-1-alpha))]',
};

export interface DismissibleBannerProps extends PropsWithChildren {
  type?: BannerType;
  persistentKey: string;
  className?: string;
}

export function DismissibleBanner({
  type,
  persistentKey,
  className,
  children,
}: DismissibleBannerProps) {
  const [dismissed, setDismissed] = useState(
    Boolean(localStorage.getItem(persistentKey)),
  );
  const [closed, setClosed] = useState(false);

  if (dismissed || closed) {
    return null;
  }

  return (
    <div
      className={classNames(
        'p-[8px] flex justify-center',
        BannerClassNames[type ?? 'info'],
        className,
      )}
    >
      <div className="flex grow justify-center text-[14px] leading-[20px]">
        {children}
      </div>
      <div className="flex items-center gap-[10px] leading-none">
        <Typography.Text
          type="secondary"
          fontSize="12px"
          className="cursor-pointer"
          onClick={() => {
            localStorage.setItem(persistentKey, '1');
            setDismissed(true);
          }}
        >
          {I18n.t('not_show_again')}
        </Typography.Text>
        <IconButton
          color="secondary"
          size="mini"
          className="!h-[unset]"
          icon={<IconCozCross className="w-[16px] h-[16px]" />}
          onClick={() => setClosed(true)}
        />
      </div>
    </div>
  );
}
