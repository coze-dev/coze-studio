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

import { type ReactNode } from 'react';

import cls from 'classnames';
import { Typography } from '@coze-arch/coze-design';

interface IDocumentItemProps {
  id: string;
  onClick: (id: string) => void;
  selected: boolean;
  title: string;
  status?: 'pending' | 'finished' | 'failed';
  addonAfter?: ReactNode;
}

export const DocumentItem: React.FC<IDocumentItemProps> = props => {
  const { id, onClick, title, selected, addonAfter } = props;

  return (
    <div
      className={cls(
        'w-full h-8 px-2 py-[6px] rounded-[8px] hover:coz-mg-primary cursor-pointer flex flex-nowrap',
        selected && 'coz-mg-primary',
      )}
      onClick={() => onClick(id)}
    >
      <Typography.Text
        className="w-full coz-fg-primary text-[14px] leading-[20px] grow truncate"
        ellipsis
      >
        {title}
      </Typography.Text>
      {addonAfter}
    </div>
  );
};

export default DocumentItem;
