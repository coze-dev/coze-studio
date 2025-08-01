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
