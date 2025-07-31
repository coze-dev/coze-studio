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

import { type MouseEventHandler, type CSSProperties, type FC } from 'react';

import classnames from 'classnames';
import { useNodeTestId } from '@coze-workflow/base';
import { Tag } from '@coze-arch/coze-design';

import { type FileItem } from '@/hooks/use-upload';
import { FileIcon } from '@/components/file-icon';

export interface FileTagProps {
  value: FileItem;
  onClose: MouseEventHandler<HTMLElement>;
  style?: CSSProperties;
  testId?: string;
}
export const FileTag: FC<FileTagProps> = ({
  value,
  onClose,
  style,
  testId,
}) => {
  const { concatTestId } = useNodeTestId();
  return (
    <Tag
      size="mini"
      closable
      color="primary"
      onClose={(children, event) => onClose(event)}
      className="w-full max-w-full min-w-[65%] overflow-hidden"
      visible
      style={{
        padding: '0 4px 0 1px',
        height: 20,
        ...style,
      }}
    >
      <div className="flex w-0 grow overflow-hidden">
        <div
          className="flex min-w-0 grow gap-[2px] items-center"
          data-testid={concatTestId(testId ?? '', 'file-tag')}
        >
          <FileIcon
            iconStyle={{ borderRadius: 'var(--coze-3)' }}
            file={value}
            size={18}
          />
          <div
            className={classnames(
              'coz-fg-primary text-[12px] flex-1 truncate font-medium',
            )}
          >
            {value.name}
          </div>
        </div>
      </div>
    </Tag>
  );
};
