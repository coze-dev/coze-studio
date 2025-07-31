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
