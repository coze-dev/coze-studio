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

  /** Get the current value */
  public get value(): string {
    return this.innerValue;
  }

  /** External setting model values */
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

  /** Get all blocks */
  public get blocks(): CommentEditorBlock[] {
    return this.innerBlocks;
  }

  /** Get editor DOM node */
  public get element(): HTMLDivElement | null {
    try {
      return ReactEditor.toDOMNode(this.editor, this.editor) as HTMLDivElement;
      // eslint-disable-next-line @coze-arch/use-error-in-catch -- no need
    } catch (error) {
      return null;
    }
  }

  /** Register command */
  public registerCommand(command: CommentEditorCommand): this {
    this.commands.push(command);
    return this;
  }

  /** keyboard event */
  public keydown(
    event: Parameters<KeyboardEventHandler<HTMLDivElement>>[0],
  ): void {
    const { ctrlKey, metaKey, shiftKey, key } = event;
    // Use ctrlKey or metaKey as a unified modifier key check
    const modifierKey = ctrlKey || metaKey;
    // Iterate through all registered commands
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

  /** paste event */
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
      // Clear list format to prevent nesting of lists under paste scenes
      this.markBlock(CommentEditorBlockFormat.Paragraph);
    }
  }

  /** Register an event */
  public on<T extends CommentEditorEvent>(
    event: T,
    callback: (params: CommentEditorEventParams<T>) => void,
  ): CommentEditorEventDisposer {
    this.emitter.on(event, callback);
    return () => {
      this.emitter.off(event, callback);
    };
  }

  /** Editor Focus/Out of Focus */
  public setFocus(focused: boolean): void {
    if (focused && !this.focused) {
      ReactEditor.focus(this.editor);
    } else if (!focused && this.focused) {
      ReactEditor.blur(this.editor);
      ReactEditor.deselect(this.editor);
      this.emitter.emit(CommentEditorEvent.Blur, {});
    }
  }

  /** Select end */
  public selectEnd(): void {
    // Get all nodes in the editor
    const nodes = Array.from(
      Editor.nodes(this.editor, {
        at: [],
        match: n => Editor.isBlock(this.editor, n as SlateElement),
      }),
    );

    // If there is no node, return directly
    if (nodes.length === 0) {
      return;
    }

    // Get the path to the last block-level node
    const lastNodeEntry = nodes[nodes.length - 1];
    const lastPath = lastNodeEntry[1];

    // Get the end point of the last node
    const endPoint = Editor.end(this.editor, lastPath);

    // Create a new range, starting and ending at the end of the last node
    const range: Range = {
      anchor: endPoint,
      focus: endPoint,
    };

    // Set the selection to the newly created range
    Transforms.select(this.editor, range);
  }

  /** Get focus status */
  public get focused(): boolean {
    return ReactEditor.isFocused(this.editor);
  }

  /** data change event */
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

  /** tag block */
  public markBlock(format: CommentEditorBlockFormat): void {
    const isMarked = this.isBlockMarked(format);
    const isListBlock = CommentEditorListBlockFormat.includes(format);
    // Empty parent existing blocks
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
        // Reset to paragraph
        return CommentEditorBlockFormat.Paragraph;
      }
      if (isListBlock) {
        // List block is reset to list item
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

  /** Is the block marked? */
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

  /** Mark leaves */
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

  /** Are the leaves marked? */
  public isLeafMarked(format: CommentEditorFormat): boolean {
    const marks = Editor.marks(this.editor);
    return !!marks && !!marks[format];
  }

  /** Get leaf value */
  public getLeafValue(
    format: CommentEditorFormat,
  ): boolean | string | undefined {
    const marks = Editor.marks(this.editor);
    return marks?.[format];
  }

  /** Set leaf value */
  public setLeafValue(
    format: CommentEditorFormat,
    value: boolean | string = true,
  ): void {
    Editor.addMark(this.editor, format, value);
  }

  /** Clear all formatting of the current block */
  public clearFormat(): void {
    Object.values(CommentEditorLeafFormat).forEach(format => {
      Editor.removeMark(this.editor, format);
    });
    this.markBlock(CommentEditorBlockFormat.Paragraph);
  }

  /** Get block text */
  public getBlockText(): {
    text: string;
    before: string;
    after: string;
  } {
    const { selection } = this.editor;
    const emptyResult = { text: '', before: '', after: '' };

    // If no cursor exists, return an empty result
    if (!selection?.anchor) {
      return emptyResult;
    }

    // Get the current block-level element
    const entry = Editor.above(this.editor, {
      match: (n): boolean =>
        SlateElement.isElement(n) && Editor.isBlock(this.editor, n),
    });

    // If no block-level elements are found, an empty result is returned
    if (!entry) {
      return emptyResult;
    }

    const [block, path] = entry;

    // Make sure the block is an Element type
    if (!SlateElement.isElement(block)) {
      return emptyResult;
    }

    // Get the full text
    const text = SlateNode.string(block);

    // Create a range from the beginning of the block to the current cursor position
    const beforeRange = {
      anchor: Editor.start(this.editor, path),
      focus: selection.anchor,
    };

    // Get the text in front of the cursor
    const before = Editor.string(this.editor, beforeRange);

    // Calculate the text after the cursor
    const after = text.slice(before.length);

    return { text, before, after };
  }

  /** Create editor */
  private createEditor(): ReactEditor {
    return this.withInsertBreak(withReact(withHistory(createEditor())));
  }

  /** Whether to initialize */
  private get initialized(): boolean {
    return (
      Array.isArray(this.editor.children) && this.editor.children.length > 0
    );
  }

  /**
   * Synchronize editor instance content
   * > ** NOTICE: ** * To ensure that performance is not affected, it should only be called when an external value change causes the editor value to be inconsistent with the model value.
   */
  private syncEditorValue(): void {
    if (!this.initialized) {
      // Slate DOM is not created when not initialized, no active synchronization is required, otherwise Slate will report an error and cannot find the DOM.
      return;
    }
    try {
      Editor.withoutNormalizing(this.editor, () => {
        // Delete all existing content
        Transforms.delete(this.editor, {
          at: {
            anchor: Editor.start(this.editor, []),
            focus: Editor.end(this.editor, []),
          },
        });
        // Make sure the selection is at the beginning of the document
        Transforms.select(this.editor, Editor.start(this.editor, []));
        // Insert a new blank document
        // Set the children of the editor directly
        this.editor.children = this.blocks as unknown as Descendant[];
      });
    } catch (error) {
      // There may be DOM handling errors inside Slate, which will not affect external use
      console.error('@CommentEditorModel::SyncEditorValue::Error', error);
    }
  }

  /** Insert newline */
  private withInsertBreak(editor: ReactEditor): ReactEditor {
    const { insertBreak } = editor;

    editor.insertBreak = () => {
      const { selection } = editor;

      // If there is no selection or the selection is not collapsed, perform the default line wrapping operation
      if (!selection || !Range.isCollapsed(selection)) {
        insertBreak();
        return;
      }

      const result = Editor.above(editor, {
        match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      });

      const { after } = this.getBlockText();

      // If no block is found or not at the end of the line, perform the default line break
      if (!result || after !== '') {
        insertBreak();
        return;
      }

      const [node, path] = result;
      const blockType = (node as unknown as CommentEditorBlock).type;

      // Execute the original line feed
      insertBreak();

      // Get the path to the newly inserted block
      const newPath = SlatePath.next(path);

      // Clear formatting only if it is not a list or a reference
      const shouldClearFormat = ![
        CommentEditorBlockFormat.NumberedList,
        CommentEditorBlockFormat.BulletedList,
        CommentEditorBlockFormat.ListItem,
        CommentEditorBlockFormat.Blockquote,
      ].includes(blockType as CommentEditorBlockFormat);

      if (shouldClearFormat) {
        this.clearFormatAtPath(newPath);
      }

      // Make sure the cursor is at the beginning of a new line
      Transforms.select(editor, Editor.start(editor, newPath));
    };

    return editor;
  }

  /** Clears the block-level and internal connection formats of the specified path */
  private clearFormatAtPath(path: SlatePath): void {
    // Select the entire block of the specified path
    Transforms.select(this.editor, path);

    // Use the existing clearFormat method to clear the format
    this.clearFormat();
  }

  /** data change event */
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

  /** radio event */
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

  /** multiple choice event */
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

  /** Serialization */
  private serialize(blocks: CommentEditorBlock[]): string | undefined {
    return CommentEditorParser.toJSON(blocks);
  }

  /** deserialization */
  private deserialize(value?: string): CommentEditorBlock[] | undefined {
    return CommentEditorParser.fromJSON(value);
  }
}
