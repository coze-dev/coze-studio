import { useMemo, useRef, useState } from 'react';

import classNames from 'classnames';
import { useHover } from 'ahooks';
import { ImagePreview } from '@coze-arch/bot-semi';

import { DeleteFileButton } from '../delete-file-button';
import { FileStatus, type FileData } from '../../../store/types';
import { ImageFileMask } from './mask';

import s from './index.module.less';

export const ImageFile: React.FC<FileData & { className?: string }> = props => {
  const { file, id, status } = props;
  const ref = useRef<HTMLDivElement>(null);
  const isHover = useHover(ref);
  const blobUrl = useMemo(() => URL.createObjectURL(file), [file]);
  const [visible, setVisible] = useState(false);

  const handlePreview = () => {
    if (status !== FileStatus.Success) {
      return;
    }
    setVisible(true);
  };

  return (
    <ImagePreview src={blobUrl} visible={visible} onVisibleChange={setVisible}>
      <div
        onClick={handlePreview}
        ref={ref}
        className={classNames(s['image-file'], props.className)}
        style={{ backgroundImage: `url(${blobUrl})` }}
      >
        <ImageFileMask {...props} />
        {isHover ? <DeleteFileButton fileId={id} /> : null}
      </div>
    </ImagePreview>
  );
};
