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
 
/* eslint-disable @typescript-eslint/require-await -- async to avoid block slate render */
import type { KeyboardEventHandler, ClipboardEvent } from 'react';

import { ReactEditor, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import {
  type BaseEditor,
  type Descendant,
  createEditor,
  Range,
  Transforms,
  Editor,
  Element as SlateElement,
  Node as SlateNode,
  Path as SlatePath,
} from 'slate';
import EventEmitter from 'eventemitter3';

import type {
  CommentEditorEventDisposer,
  CommentEditorEventParams,
  CommentEditorBlock,
  CommentEditorFormat,
  CommentEditorElement,
  CommentEditorNode,
  CommentEditorCommand,
} from './type';
import { CommentEditorParser } from './parsers';
import {
  CommentEditorBlockFormat,
  CommentEditorEvent,
  CommentEditorLeafFormat,
  CommentEditorListBlockFormat,
  CommentEditorDefaultValue,
  CommentEditorDefaultBlocks,
} from './constant';

export class CommentEditorModel {
  public readonly editor: BaseEditor & ReactEditor;
  private innerValue: string;
  private innerBlocks: CommentEditorBlock[];
  private emitter: EventEmitter;
  private commands: CommentEditorCommand[];

  constructor() {
    this.commands = [];
    this.emitter = new EventEmitter();
    this.editor = this.createEditor();
    this.innerValue = CommentEditorDefaultValue;
    this.innerBlocks = CommentEditorDefaultBlocks as CommentEditorBlock[];
  }

  /** 获取当前值 */
  public get value(): string {
    return this.innerValue;
  }

  /** 外部设置模型值 */
  public setValue(newValue?: string): void {
    const value = newValue ?? CommentEditorDefaultValue;
    if (value === this.innerValue) {
      return;
    }
    const blocks = this.deserialize(value);
    if (!blocks) {
      return;
    }
    this.innerValue = value;
    this.innerBlocks = blocks;
    this.syncEditorValue();
    this.emitter.emit(CommentEditorEvent.Change, {
      blocks: this.innerBlocks,
      value: this.innerValue,
    });
  }

  /** 获取所有块 */
  public get blocks(): CommentEditorBlock[] {
    return this.innerBlocks;
  }

  /** 获取编辑器 DOM 节点 */
  public get element(): HTMLDivElement | null {
    try {
      return ReactEditor.toDOMNode(this.editor, this.editor) as HTMLDivElement;
      // eslint-disable-next-line @coze-arch/use-error-in-catch -- no need
    } catch (error) {
      return null;
    }
  }

  /** 注册命令 */
  public registerCommand(command: CommentEditorCommand): this {
    this.commands.push(command);
    return this;
  }

  /** 键盘事件 */
  public keydown(
    event: Parameters<KeyboardEventHandler<HTMLDivElement>>[0],
  ): void {
    const { ctrlKey, metaKey, shiftKey, key } = event;
    // 使用 ctrlKey 或 metaKey 作为统一的修饰键检查
    const modifierKey = ctrlKey || metaKey;
    // 遍历所有注册的命令
    const matchedCommands = this.commands
      .filter(command => command.key === key)
      .filter(
        command =>
          command.modifier === undefined || command.modifier === modifierKey,
      )
      .filter(
        command => command.shift === undefined || command.shift === shiftKey,
      );

    matchedCommands.forEach(command => {
      command.exec({
        model: this,
        event,
      });
    });
  }

  /** 粘贴事件 */
  public paste(event: ClipboardEvent<HTMLDivElement>): void {
    const fragment = event.clipboardData.getData(
      'application/x-slate-fragment',
    );
    const decoded = decodeURIComponent(window.atob(fragment));
    if (!decoded) {
      return;
    }
    const parsed = JSON.parse(decoded) as CommentEditorBlock[];
    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      return;
    }
    if (this.isBlockMarked(CommentEditorBlockFormat.ListItem)) {
      // 清除列表格式，防止粘贴场景下列表嵌套
      this.markBlock(CommentEditorBlockFormat.Paragraph);
    }
  }

  /** 注册事件 */
  public on<T extends CommentEditorEvent>(
    event: T,
    callback: (params: CommentEditorEventParams<T>) => void,
  ): CommentEditorEventDisposer {
    this.emitter.on(event, callback);
    return () => {
      this.emitter.off(event, callback);
    };
  }

  /** 编辑器聚焦/失焦 */
  public setFocus(focused: boolean): void {
    if (focused && !this.focused) {
      ReactEditor.focus(this.editor);
    } else if (!focused && this.focused) {
      ReactEditor.blur(this.editor);
      ReactEditor.deselect(this.editor);
      this.emitter.emit(CommentEditorEvent.Blur, {});
    }
  }

  /** 选择末尾 */
  public selectEnd(): void {
    // 获取编辑器中的所有节点
    const nodes = Array.from(
      Editor.nodes(this.editor, {
        at: [],
        match: n => Editor.isBlock(this.editor, n as SlateElement),
      }),
    );

    // 如果没有节点，直接返回
    if (nodes.length === 0) {
      return;
    }

    // 获取最后一个块级节点的路径
    const lastNodeEntry = nodes[nodes.length - 1];
    const lastPath = lastNodeEntry[1];

    // 获取最后一个节点的末尾点
    const endPoint = Editor.end(this.editor, lastPath);

    // 创建一个新的范围，起点和终点都是最后一个节点的末尾
    const range: Range = {
      anchor: endPoint,
      focus: endPoint,
    };

    // 将选择设置为新创建的范围
    Transforms.select(this.editor, range);
  }

  /** 获取聚焦状态 */
  public get focused(): boolean {
    return ReactEditor.isFocused(this.editor);
  }

  /** 数据变更事件 */
  public async fireChange(): Promise<void> {
    const isAstChange = this.editor.operations.some(
      op => 'set_selection' !== op.type,
    );
    if (isAstChange) {
      this.change();
    }
    const { selection } = this.editor;
    if (selection) {
      if (Range.isCollapsed(selection)) {
        this.select();
      } else {
        this.multiSelect();
      }
    }
  }

  /** 标记块 */
  public markBlock(format: CommentEditorBlockFormat): void {
    const isMarked = this.isBlockMarked(format);
    const isListBlock = CommentEditorListBlockFormat.includes(format);
    // 清空父级存在的块
    Transforms.unwrapNodes<CommentEditorNode>(this.editor, {
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        CommentEditorListBlockFormat.includes(
          (n as unknown as CommentEditorBlock).type,
        ),
      split: true,
    });
    const getBlockType = () => {
      if (isMarked) {
        // 重置为段落
        return CommentEditorBlockFormat.Paragraph;
      }
      if (isListBlock) {
        // 列表块重置为列表项
        return CommentEditorBlockFormat.ListItem;
      }
      return format;
    };
    const properties: Partial<CommentEditorBlock> = {
      type: getBlockType(),
    };
    Transforms.setNodes<CommentEditorNode>(
      this.editor,
      properties as CommentEditorNode,
    );
    if (isMarked) {
      return;
    }
    if (isListBlock) {
      const block = { type: format, children: [] };
      Transforms.wrapNodes<CommentEditorNode>(
        this.editor,
        block as CommentEditorElement,
      );
      return;
    }
  }

  /** 块是否标记 */
  public isBlockMarked(format: CommentEditorBlockFormat): boolean {
    const { selection } = this.editor;
    if (!selection) {
      return false;
    }

    const [match] = Array.from(
      Editor.nodes(this.editor, {
        at: Editor.unhangRange(this.editor, selection),
        match: n =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          (n as unknown as CommentEditorBlock).type === format,
      }),
    );
    return !!match;
  }

  /** 标记叶子 */
  public markLeaf(
    format: CommentEditorLeafFormat,
    value: boolean | string = true,
  ): void {
    const isMarked = this.isLeafMarked(format);
    if (isMarked) {
      Editor.removeMark(this.editor, format);
    } else {
      Editor.addMark(this.editor, format, value);
    }
  }

  /** 叶子是否标记 */
  public isLeafMarked(format: CommentEditorFormat): boolean {
    const marks = Editor.marks(this.editor);
    return !!marks && !!marks[format];
  }

  /** 获取叶子值 */
  public getLeafValue(
    format: CommentEditorFormat,
  ): boolean | string | undefined {
    const marks = Editor.marks(this.editor);
    return marks?.[format];
  }

  /** 设置叶子值 */
  public setLeafValue(
    format: CommentEditorFormat,
    value: boolean | string = true,
  ): void {
    Editor.addMark(this.editor, format, value);
  }

  /** 清除当前块的所有格式 */
  public clearFormat(): void {
    Object.values(CommentEditorLeafFormat).forEach(format => {
      Editor.removeMark(this.editor, format);
    });
    this.markBlock(CommentEditorBlockFormat.Paragraph);
  }

  /** 获取块文本 */
  public getBlockText(): {
    text: string;
    before: string;
    after: string;
  } {
    const { selection } = this.editor;
    const emptyResult = { text: '', before: '', after: '' };

    // 如果不存在光标，返回空结果
    if (!selection?.anchor) {
      return emptyResult;
    }

    // 获取当前块级元素
    const entry = Editor.above(this.editor, {
      match: (n): boolean =>
        SlateElement.isElement(n) && Editor.isBlock(this.editor, n),
    });

    // 如果没有找到块级元素，返回空结果
    if (!entry) {
      return emptyResult;
    }

    const [block, path] = entry;

    // 确保 block 是 Element 类型
    if (!SlateElement.isElement(block)) {
      return emptyResult;
    }

    // 获取完整文本
    const text = SlateNode.string(block);

    // 创建一个范围从块的开始到当前光标位置
    const beforeRange = {
      anchor: Editor.start(this.editor, path),
      focus: selection.anchor,
    };

    // 获取光标前的文本
    const before = Editor.string(this.editor, beforeRange);

    // 计算光标后的文本
    const after = text.slice(before.length);

    return { text, before, after };
  }

  /** 创建编辑器 */
  private createEditor(): ReactEditor {
    return this.withInsertBreak(withReact(withHistory(createEditor())));
  }

  /** 是否初始化 */
  private get initialized(): boolean {
    return (
      Array.isArray(this.editor.children) && this.editor.children.length > 0
    );
  }

  /**
   * 同步编辑器实例内容
   * > **NOTICE:** *为确保不影响性能，应仅在外部值变更导致编辑器值与模型值不一致时调用*
   */
  private syncEditorValue(): void {
    if (!this.initialized) {
      // 未初始化时 Slate DOM 未创建，无需主动同步，否则 Slate 会报错找不到 DOM
      return;
    }
    try {
      Editor.withoutNormalizing(this.editor, () => {
        // 删除所有现有内容
        Transforms.delete(this.editor, {
          at: {
            anchor: Editor.start(this.editor, []),
            focus: Editor.end(this.editor, []),
          },
        });
        // 确保选区在文档开始
        Transforms.select(this.editor, Editor.start(this.editor, []));
        // 插入新的空白文档
        // 直接设置编辑器的 children
        this.editor.children = this.blocks as unknown as Descendant[];
      });
    } catch (error) {
      // Slate 内部可能存在 DOM 处理错误，不会影响外部使用
      console.error('@CommentEditorModel::SyncEditorValue::Error', error);
    }
  }

  /** 插入换行 */
  private withInsertBreak(editor: ReactEditor): ReactEditor {
    const { insertBreak } = editor;

    editor.insertBreak = () => {
      const { selection } = editor;

      // 如果没有选择或选择不是折叠的，执行默认的换行操作
      if (!selection || !Range.isCollapsed(selection)) {
        insertBreak();
        return;
      }

      const result = Editor.above(editor, {
        match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      });

      const { after } = this.getBlockText();

      // 如果没有找到块或者不在行尾，执行默认的换行操作
      if (!result || after !== '') {
        insertBreak();
        return;
      }

      const [node, path] = result;
      const blockType = (node as unknown as CommentEditorBlock).type;

      // 执行原本的换行操作
      insertBreak();

      // 获取新插入的块的路径
      const newPath = SlatePath.next(path);

      // 只有在非列表和非引用的情况下才清除格式
      const shouldClearFormat = ![
        CommentEditorBlockFormat.NumberedList,
        CommentEditorBlockFormat.BulletedList,
        CommentEditorBlockFormat.ListItem,
        CommentEditorBlockFormat.Blockquote,
      ].includes(blockType as CommentEditorBlockFormat);

      if (shouldClearFormat) {
        this.clearFormatAtPath(newPath);
      }

      // 确保光标在新行的开始
      Transforms.select(editor, Editor.start(editor, newPath));
    };

    return editor;
  }

  /** 清除指定路径的块级格式和内联格式 */
  private clearFormatAtPath(path: SlatePath): void {
    // 选中指定路径的整个块
    Transforms.select(this.editor, path);

    // 使用现有的 clearFormat 方法清除格式
    this.clearFormat();
  }

  /** 数据变更事件 */
  private change(): void {
    this.innerBlocks = this.editor.children as unknown as CommentEditorBlock[];
    const value = this.serialize(this.innerBlocks);
    if (!value) {
      return;
    }
    this.innerValue = value;
    this.emitter.emit(CommentEditorEvent.Change, {
      blocks: this.innerBlocks,
      value: this.innerValue,
    });
  }

  /** 单选事件 */
  private select(): void {
    const { selection } = this.editor;
    if (!selection) {
      return;
    }
    const text = Editor.string(this.editor, selection);
    if (text !== '') {
      return;
    }
    this.emitter.emit(CommentEditorEvent.Select, {});
  }

  /** 多选事件 */
  private multiSelect(): void {
    const { selection } = this.editor;
    if (!selection) {
      return;
    }
    const text = Editor.string(this.editor, selection);
    if (text === '') {
      return;
    }
    this.emitter.emit(CommentEditorEvent.MultiSelect, {});
  }

  /** 序列化 */
  private serialize(blocks: CommentEditorBlock[]): string | undefined {
    return CommentEditorParser.toJSON(blocks);
  }

  /** 反序列化 */
  private deserialize(value?: string): CommentEditorBlock[] | undefined {
    return CommentEditorParser.fromJSON(value);
  }
}
