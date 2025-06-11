import classNames from 'classnames';

import { useUploadContext } from '../upload-context';
import { FileUploadBtn } from './file-upload-btn';
import { FileTag } from './file-tag';

export const MultipleInputNew = () => {
  const { fileList, triggerUpload, isImage, handleDelete } = useUploadContext();

  const hasValue = !!fileList[0];

  return (
    <div
      className={classNames('w-full h-full flex items-center', {
        'cursor-pointer': !hasValue,
      })}
      onClick={() => triggerUpload()}
    >
      <div className="flex flex-row flex-wrap gap-0.5 w-full h-full">
        {hasValue
          ? fileList.map(file => (
              <FileTag
                value={file}
                onClose={e => {
                  e.stopPropagation();
                  handleDelete(file.uid);
                }}
              />
            ))
          : null}
        <FileUploadBtn isImage={isImage} />
      </div>
    </div>
  );
};
