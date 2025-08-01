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

import { type IPlugin, type Program, after } from '@coze-arch/idl2ts-plugin';
import { type IParseEntryCtx } from '@coze-arch/idl2ts-helper';
import { HOOK } from '@coze-arch/idl2ts-generator';

/**
 *
 * @param {string} content
 * @param {"CommentBlock" | "CommentLine"} type
 * @returns {{
 *   value: string;
 *   type: "CommentBlock" | "CommentLine";
 * }}
 */
function createComment(content, type = 'CommentBlock') {
  return {
    value: content,
    type,
  };
}

export class CommentPlugin implements IPlugin {
  config: { comments: string[] };
  comments: any[] = [];
  /**
   * @param {{comments: string[]}} config
   */
  constructor(config) {
    this.config = config;
  }

  apply(program: Program) {
    program.register(after(HOOK.GEN_FILE_AST), this.addComment.bind(this));
  }

  addComment(ctx: IParseEntryCtx) {
    const { files } = ctx;
    for (const [file, res] of files.entries()) {
      if (
        res.type === 'babel' &&
        file.includes('/auto-gen/') &&
        file.endsWith('.ts')
      ) {
        res.content.leadingComments = this.getComments();
      }
    }
    return ctx;
  }

  getComments() {
    if (this.comments) {
      return this.comments;
    }
    this.comments = this.config.comments.map(i => createComment(i));
    return this.comments;
  }
}
