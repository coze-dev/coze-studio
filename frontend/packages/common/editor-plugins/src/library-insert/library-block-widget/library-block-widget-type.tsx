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

import { type RefObject, useLayoutEffect, useState } from 'react';

import { type Root, createRoot } from 'react-dom/client';
import cls from 'classnames';
import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { Tooltip } from '@coze-arch/coze-design';
import { WidgetType } from '@codemirror/view';

import { getLibraryTooltip } from '../utils/get-library-tooltip';
import { type LibraryStatus } from '../utils/get-library-status';
import { type LibraryBlockInfo, type ILibraryItem } from '../types';
interface LibraryBlockWidgetOptions {
  editorRef: RefObject<EditorAPI>;
  blockDataInfo: LibraryBlockInfo | null;
  libraryItem: ILibraryItem | null;
  content: string;
  hightlight: boolean;
  libraryStatus: LibraryStatus;
  readonly: boolean;
  spaceId?: string;
  className?: string;
  onAddLibrary?: (library: ILibraryItem) => void;
  range: {
    left: number;
    right: number;
  };
  projectId?: string;
  avatarBotId?: string;
  onRename?: (pos: { from: number; to: number }) => void;
  disabledTooltips?: boolean;
}

function createElement(
  name: string,
  attributes: Record<string, string>,
  children: (HTMLElement | string)[] = [],
) {
  const el = document.createElement(name);
  for (const [key, value] of Object.entries(attributes)) {
    el.setAttribute(key, value);
  }
  for (const child of children) {
    if (typeof child === 'string') {
      const text = document.createTextNode(child);
      el.appendChild(text);
    } else {
      el.appendChild(child);
    }
  }
  return el;
}

export class LibraryBlockWidgetType extends WidgetType {
  private options: LibraryBlockWidgetOptions | null;
  private container: HTMLSpanElement;
  private root: Root | null;
  private dom: HTMLSpanElement | undefined;
  private mounted: boolean;

  constructor(options: LibraryBlockWidgetOptions | null) {
    super();
    this.options = options;
    this.container = document.createElement('span');
    this.root = null;
    this.mounted = false;
  }

  toDOM() {
    if (!this.options) {
      return this.container;
    }

    if (this.root) {
      this.destroy();
    }

    if (!this.mounted) {
      // Synchronized rendering to avoid jitter
      this.renderLibraryBlock(this.options);
      this.renderTooltip(this.options);
      this.mounted = true;
    }

    return this.container;
  }

  renderLibraryBlock(options: LibraryBlockWidgetOptions) {
    const dom = createElement(
      'span',
      {
        class: cls('library-block-container leading-5', options.className, {
          '!coz-mg-hglt !text-[#9498F7] !text-opacity-70': !options.hightlight,
        }),
      },
      [
        createElement('img', {
          src: options.blockDataInfo?.icon || '',
          class: cls('library-block-icon', {
            '!opacity-70': !options.hightlight,
          }),
        }),
        createElement(
          'span',
          {
            class: 'library-block-content',
          },
          [options.content],
        ),
      ],
    );

    this.dom = dom;
    this.container.appendChild(dom);
  }

  renderTooltip(options: LibraryBlockWidgetOptions) {
    const tooltipTriggerDOM = document.createElement('span');

    this.root = createRoot(tooltipTriggerDOM);
    this.container.appendChild(tooltipTriggerDOM);

    this.root.render(
      <LibraryBlockWidgetReactCom
        editorRef={options.editorRef}
        blockDataInfo={options?.blockDataInfo}
        libraryItem={options.libraryItem}
        content={options.content}
        hightlight={options.hightlight}
        readonly={options.readonly}
        libraryStatus={options.libraryStatus}
        onAddLibrary={options.onAddLibrary}
        onRename={options.onRename}
        spaceId={options.spaceId ?? ''}
        range={options.range}
        beforeMount={() => {
          const element = this.dom;
          if (element?.parentNode) {
            element.parentNode.removeChild(element);
          }
        }}
        projectId={options.projectId}
        avatarBotId={options.avatarBotId}
        disabledTooltips={options.disabledTooltips}
      />,
    );
  }

  destroy() {
    this.mounted = false;

    if (this.root) {
      /**
       * Fix React warning: Attempted to synchronously unmount a root while React was already rendering
       * https://stackoverflow.com/questions/73043828/how-to-unmount-something-created-with-createroot-properly
       */
      setTimeout(() => {
        this.root?.unmount();
      }, 0);
      this.root = null;
    }

    if (this.dom) {
      this.dom.remove();
      this.dom = undefined;
    }

    this.options = null;
  }
}

export const LibraryBlockWidgetReactCom = (props: {
  editorRef: RefObject<EditorAPI>;
  blockDataInfo: LibraryBlockInfo | null;
  libraryItem: ILibraryItem | null;
  content: string;
  hightlight?: boolean;
  readonly: boolean;
  libraryStatus: LibraryStatus;
  onAddLibrary?: (library: ILibraryItem) => void;
  spaceId: string;
  range: {
    left: number;
    right: number;
  };
  beforeMount: () => void;
  className?: string;
  projectId?: string;
  avatarBotId?: string;
  onRename?: (pos: { from: number; to: number }) => void;
  disabledTooltips?: boolean;
}) => {
  const {
    blockDataInfo,
    libraryItem,
    content,
    hightlight = true,
    libraryStatus,
    onAddLibrary,
    readonly,
    spaceId,
    range,
    editorRef,
    beforeMount,
    className,
    projectId,
    avatarBotId,
    onRename,
    disabledTooltips,
  } = props;

  const [tooltipConfig, setTooltipConfig] = useState<
    React.ComponentProps<typeof Tooltip> | undefined
  >(undefined);

  const loadTooltipConfig = async () => {
    if (!editorRef.current) {
      return;
    }

    const res = await getLibraryTooltip({
      editorRef,
      libraryStatus,
      readonly,
      libraryItem,
      blockDataInfo,
      onAddLibrary,
      spaceId,
      range,
      projectId,
      avatarBotId,
      onRename,
      disabled: disabledTooltips,
    });
    setTooltipConfig(res.tooltipConfig);
  };

  useLayoutEffect(() => {
    beforeMount();
  }, []);

  const baseElement = (
    <span
      className={cls('library-block-container leading-5', className, {
        '!coz-mg-hglt !text-[#9498F7] !text-opacity-70': !hightlight,
      })}
      onMouseEnter={loadTooltipConfig}
    >
      <img
        src={blockDataInfo?.icon || ''}
        className={cls('library-block-icon', {
          '!opacity-70': !hightlight,
        })}
      />
      <span className="library-block-content">{content}</span>
    </span>
  );

  // Render Tooltip only if tooltipConfig exists
  if (!tooltipConfig) {
    return baseElement;
  }

  return (
    <Tooltip
      position="bottomLeft"
      spacing={{ y: 4, x: 0 }}
      showArrow={false}
      {...tooltipConfig}
    >
      {baseElement}
    </Tooltip>
  );
};
