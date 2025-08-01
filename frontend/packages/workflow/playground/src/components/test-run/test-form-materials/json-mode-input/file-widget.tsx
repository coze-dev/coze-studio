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

import { useMemo } from 'react';

import { type Root } from 'react-dom/client';
import { FileIcon, FileItemStatus, isImageFile } from '@coze-workflow/test-run';
import { I18n } from '@coze-arch/i18n';
import { Typography, Popover, Image } from '@coze-arch/coze-design';
import { type EditorView, WidgetType } from '@codemirror/view';
import { EditorSelection } from '@codemirror/state';

import { generateFileInfo } from './utils';
import { renderDom } from './render-dom';

import css from './file-widget.module.less';

interface FileDisplayProps {
  url: string;
  onClick: () => void;
}

const FileDisplay: React.FC<FileDisplayProps> = ({ url, onClick }) => {
  const file = useMemo(() => generateFileInfo(url), [url]);

  const isImage = isImageFile(file.name);

  const el = (
    <div className={css['file-widget']} onClick={onClick}>
      <FileIcon
        size={12}
        file={{
          ...file,
          status: file.uploading ? FileItemStatus.Uploading : undefined,
        }}
      />
      {file.uploading ? (
        <Typography.Text strong className={css['file-name']} ellipsis>
          {I18n.t('plugin_file_uploading')}
        </Typography.Text>
      ) : null}
      {!file.uploading && (
        <Typography.Text strong className={css['file-name']} ellipsis>
          {file.name ?? I18n.t('plugin_file_unknown')}
        </Typography.Text>
      )}
    </div>
  );

  if (isImage) {
    return (
      <Popover content={<Image src={file.url} width={126} />}>{el}</Popover>
    );
  }

  return el;
};

interface FileWidgetOptions {
  url: string;
  from: number;
  to: number;
}

export class FileWidget extends WidgetType {
  root?: Root;

  constructor(public options: FileWidgetOptions) {
    super();
  }

  toDOM(view: EditorView): HTMLElement {
    const handleClick = () => {
      const { from, to } = this.options;
      view.dispatch({
        selection: EditorSelection.range(from, to),
      });
    };
    const { root, dom } = renderDom<FileDisplayProps>(FileDisplay, {
      url: this.options.url,
      onClick: handleClick,
    });
    this.root = root;
    return dom;
  }

  eq(prev) {
    return prev.options.url === this.options.url;
  }

  destroy(): void {
    this.root?.unmount();
  }
}
