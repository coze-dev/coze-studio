import classNames from 'classnames';
import { IconCozTrashCan } from '@coze/coze-design/icons';
import { Typography } from '@coze/coze-design';

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
