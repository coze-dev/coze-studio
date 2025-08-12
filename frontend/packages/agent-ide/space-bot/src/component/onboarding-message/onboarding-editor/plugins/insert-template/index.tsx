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

import { ZoneDelta } from '@coze-common/md-editor-adapter';
import {
  Plugin,
  type Editor,
  type IRenderContext,
  Text,
} from '@coze-common/md-editor-adapter';

export class InsertTemplate extends Plugin {
  private readonly template: string;
  private editor: Editor;
  static KEY = 'insertTemplate';
  constructor(props: { editor: Editor; template: string }) {
    const { editor, template } = props;
    super();
    this.editor = editor;
    this.template = template;
    this.editor.registerCommand(
      InsertTemplate.KEY,
      this.insertTemplate.bind(this),
    );
  }

  match(attributeKey: string): boolean {
    return attributeKey === InsertTemplate.KEY;
  }

  render(props: IRenderContext): JSX.Element {
    return <Text className="font-medium">{props.children}</Text>;
  }

  insertTemplate() {
    const range = this.editor.selection.getSelection();
    const { start, end } = range;
    const zone = start.zoneId;
    const contentState = this.editor.getContentState();
    const zoneState = contentState.getZoneState(zone);
    if (!zoneState) {
      return;
    }
    const lineState = zoneState.getLine(start.line);
    if (!lineState) {
      return;
    }
    const startPos = zoneState.pointToOffset(start);
    const endPos = zoneState.pointToOffset(end);
    if (startPos === null || endPos === null) {
      return;
    }
    const delta = new ZoneDelta({ zoneId: zone });
    delta.retain(startPos).delete(endPos - startPos);
    delta.insert(this.template);
    this.editor.getContentState().apply(delta);
  }
}
