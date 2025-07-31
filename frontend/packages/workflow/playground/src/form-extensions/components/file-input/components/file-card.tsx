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

import classNames from 'classnames';
import { IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { Typography } from '@coze-arch/coze-design';

import { type FileItem } from '@/hooks/use-upload';
import { FileIcon } from '@/components/file-icon';

const { Text } = Typography;

export interface FileCardProps {
  file: FileItem;
  onDelete: () => void;
}

export const FileCard = (props: FileCardProps) => {
  const { file, onDelete } = props;

  return (
    <div className="flex p-1 hover:bg-[#0607091A] rounded-sm">
      <FileIcon file={file} />

      <Text
        ellipsis={{
          pos: 'middle',
          showTooltip: {
            opts: {
              content: file.name,
              style: { wordBreak: 'break-all' },
            },
          },
        }}
        className="break-words flex-1 ml-2"
      >
        {file?.name}
      </Text>

      <div
        className={classNames(
          'w-5 h-5',
          'ml-1',
          'rounded-[4px]',
          'flex items-center justify-center',
          'hover:bg-[#0607091A]  text-[--semi-color-text-2]',
          'cursor-pointer',
        )}
      >
        <IconCozTrashCan
          onClick={e => {
            onDelete();
          }}
        />
      </div>
    </div>
  );
};
