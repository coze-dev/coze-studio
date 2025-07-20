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
 
import type { CompositionEventHandler, KeyboardEventHandler } from 'react';

import { type ReactEditor, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import {
  Text,
  type NodeEntry,
  Transforms,
  createEditor,
  Range,
  type BaseEditor,
  Editor,
} from 'slate';
import EventEmitter from 'eventemitter3';

import { ExpressionEditorValidator } from '../validator';
import type {
  ExpressionEditorEventParams,
  ExpressionEditorRange,
  ExpressionEditorEventDisposer,
  ExpressionEditorLine,
  ExpressionEditorTreeNode,
  ExpressionEditorValidateData,
} from '../type';
import { ExpressionEditorParser } from '../parser';
import {
  ExpressionEditorEvent,
  ExpressionEditorToken,
  ExpressionEditorSignal,
} from '../constant';

export class ExpressionEditorModel {
  public readonly editor: BaseEditor & ReactEditor;
  protected innerValue: string;
  protected innerFocus: boolean;
  protected innerLines: ExpressionEditorLine[];
  protected innerVariableTree: ExpressionEditorTreeNode[];
  protected emitter: EventEmitter;

  constructor(initialValue: string) {
    this.emitter = new EventEmitter();
    this.editor = withReact(withHistory(createEditor()));
    this.innerValue = initialValue;
    this.innerLines = ExpressionEditorParser.deserialize(initialValue);
  }

  /** 设置变量树 */
  public setVariableTree(variableTree: ExpressionEditorTreeNode[]): void {
    this.innerVariableTree = variableTree;
  }

  /** 获取变量树 */
  public get variableTree(): ExpressionEditorTreeNode[] {
    return this.innerVariableTree;
  }

  /** 获取行数据 */
  public get lines(): ExpressionEditorLine[] {
    return this.innerLines;
  }

  /** 获取序列化值 */
  public get value(): string {
    return this.innerValue;
  }

  /** 外部设置模型值 */
  public setValue(value: string): void {
    if (value === this.innerValue) {
      return;
    }
    this.innerValue = value;
    this.innerLines = ExpressionEditorParser.deserialize(value);
    this.syncEditorValue();
  }

  /** 同步选中状态 */
  public setFocus(focus: boolean): void {
    if (this.innerFocus === focus) {
      return;
    }
    this.innerFocus = focus;
    if (focus) {
      // 首次选中时主动触发选区事件，主动触发变量推荐
      this.select(this.lines);
    } else if (this.innerValue !== '' && this.editor.children.length !== 0) {
      // 触发失焦且编辑器内容不为空，则重置选区
      Transforms.select(this.editor, Editor.start(this.editor, []));
    }
  }

  /** 注册事件 */
  public on<T extends ExpressionEditorEvent>(
    event: T,
    callback: (params: ExpressionEditorEventParams<T>) => void,
  ): ExpressionEditorEventDisposer {
    this.emitter.on(event, callback);
    return () => {
      this.emitter.off(event, callback);
    };
  }

  /** 数据变更事件 */
  public change(lines: ExpressionEditorLine[]): void {
    const isAstChange = this.editor.operations.some(
      op => 'set_selection' !== op.type,
    );
    if (!isAstChange) {
      return;
    }
    this.innerLines = lines;
    this.innerValue = ExpressionEditorParser.serialize(lines);
    this.emitter.emit(ExpressionEditorEvent.Change, {
      lines,
      value: this.innerValue,
    });
  }

  /** 选中事件 */
  public select(lines: ExpressionEditorLine[]): void {
    const { selection } = this.editor;
    if (!selection || !Range.isCollapsed(selection)) {
      return;
    }
    if (
      selection.anchor.offset !== selection.focus.offset ||
      selection.anchor.path[0] !== selection.focus.path[0] ||
      selection.anchor.path[1] !== selection.focus.path[1]
    ) {
      // 框选
      this.emitter.emit(ExpressionEditorEvent.Select, {
        content: '',
        offset: -1,
      });
      return;
    }
    const cursorOffset = selection.anchor.offset;
    const lineIndex = selection.anchor.path[0];
    const contentIndex = selection.anchor.path[1];
    const line = lines[lineIndex];
    if (!line) {
      return;
    }
    const content = line.children[contentIndex];
    const cursorContent = content?.text;
    if (typeof cursorContent !== 'string') {
      return;
    }
    this.emitter.emit(ExpressionEditorEvent.Select, {
      content: cursorContent,
      offset: cursorOffset,
      path: selection.anchor.path,
    });
  }

  /** 键盘事件 */
  public keydown(
    event: Parameters<KeyboardEventHandler<HTMLDivElement>>[0],
  ): void {
    if (event.key === ExpressionEditorToken.Start) {
      event.preventDefault();
      Transforms.insertText(
        this.editor,
        ExpressionEditorToken.FullStart + ExpressionEditorToken.FullEnd,
      );
      Transforms.move(this.editor, {
        distance: 2,
        reverse: true,
      });
      setTimeout(() => {
        // slate UI 渲染滞后
        this.select(this.innerLines);
      }, 0);
    }
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'a':
          event.preventDefault();
          Transforms.select(this.editor, {
            anchor: Editor.start(this.editor, []),
            focus: Editor.end(this.editor, []),
          });
          return;
        default:
          return;
      }
    }
  }

  /** 开始输入拼音 */
  public compositionStart(
    event: CompositionEventHandler<HTMLDivElement>,
  ): void {
    this.emitter.emit(ExpressionEditorEvent.CompositionStart, {
      event,
    });
  }

  /** 装饰叶子节点 */
  public get decorate(): ([node, path]: NodeEntry) => ExpressionEditorRange[] {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const decorateFn = ([node, path]: NodeEntry): ExpressionEditorRange[] => {
      const ranges: ExpressionEditorRange[] = [];
      if (!Text.isText(node)) {
        return ranges;
      }
      // 计算表达式合法/非法
      const validateList = ExpressionEditorValidator.lineTextValidate({
        lineText: node.text,
        tree: self.innerVariableTree,
      });
      validateList.forEach(validateData => {
        const { start, end, valid } = validateData;
        const rangePath = {
          anchor: { path, offset: start },
          focus: { path, offset: end },
        };
        if (valid) {
          ranges.push({
            type: ExpressionEditorSignal.Valid,
            ...rangePath,
          });
        } else {
          ranges.push({
            type: ExpressionEditorSignal.Invalid,
            ...rangePath,
          });
        }
      });
      if (!this.innerFocus) {
        return ranges;
      }
      // 以下是计算当前选中表达式逻辑
      const selectedItem = self.isValidateSelectPath([node, path]);
      const selectedValidItem = validateList.find(
        validateData =>
          validateData.valid &&
          validateData.start === selectedItem?.start &&
          validateData.end === selectedItem?.end,
      );
      if (selectedItem && selectedValidItem) {
        ranges.push({
          type: ExpressionEditorSignal.SelectedValid,
          anchor: { path, offset: selectedItem.start },
          focus: { path, offset: selectedItem.end },
        });
      } else if (selectedItem && !selectedValidItem) {
        ranges.push({
          type: ExpressionEditorSignal.SelectedInvalid,
          anchor: { path, offset: selectedItem.start },
          focus: { path, offset: selectedItem.end },
        });
      }
      return ranges;
    };
    return decorateFn;
  }

  /**
   * 同步编辑器实例内容
   * > **NOTICE:** *为确保不影响性能，应仅在外部值变更导致编辑器值与模型值不一致时调用*
   */
  private syncEditorValue(): void {
    // 删除编辑器内所有行
    this.editor.children.forEach((line, index) => {
      Transforms.removeNodes(this.editor, {
        at: [index],
      });
    });
    // 重新在编辑器插入当前行内容
    this.lines.forEach((line, index) => {
      Transforms.insertNodes(this.editor, line, {
        at: [this.editor.children.length],
      });
    });
  }

  private isValidateSelectPath([node, path]: NodeEntry):
    | ExpressionEditorValidateData
    | undefined {
    if (!Text.isText(node)) {
      return;
    }
    const { selection } = this.editor;
    if (!selection) {
      return;
    }
    const cursorOffset = selection.anchor.offset;
    const lineIndex = selection.anchor.path[0];
    const contentIndex = selection.anchor.path[1];
    if (lineIndex !== path[0] || contentIndex !== path[1]) {
      return;
    }
    const lineContent = node.text;
    const lineOffset = cursorOffset;
    const parsedData = ExpressionEditorParser.parse({
      lineContent,
      lineOffset,
    });
    if (!parsedData) {
      return;
    }
    return {
      start: parsedData.offset.lastStart - 1,
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      end: parsedData.offset.firstEnd + 2,
      valid: true,
    };
  }
}
