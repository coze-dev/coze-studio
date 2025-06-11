import { IconCloseNoCycle } from '@coze-arch/bot-icons';

import { useDeleteFile } from '../../../hooks/file/use-delete-file';

import s from './index.module.less';
export const DeleteFileButton: React.FC<{
  fileId: string;
}> = ({ fileId }) => {
  const deleteFile = useDeleteFile();
  const onDelete = () => {
    deleteFile(fileId);
  };
  return (
    <div className={s['icon-close']} onClick={onDelete}>
      <IconCloseNoCycle />
    </div>
  );
};
