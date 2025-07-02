import { useUploadContext } from '../upload-context';
import { FileCard } from './file-card';

export const FileList = () => {
  const { fileList, handleDelete } = useUploadContext();

  return (
    <div className="w-[300px] max-h-[448px] space-y-3">
      {fileList.map((file, _index) => (
        <FileCard file={file} onDelete={() => handleDelete(file.uid)} />
      ))}
    </div>
  );
};
