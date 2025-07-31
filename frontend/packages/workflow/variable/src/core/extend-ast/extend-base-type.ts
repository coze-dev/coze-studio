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

import {
  type ASTNodeJSON,
  BaseType,
} from '@flowgram-adapter/free-layout-editor';
import { type ViewVariableType } from '@coze-workflow/base/types';

import { ExtendASTKind } from '../types';

interface ExtendBaseTypeJSON {
  type: ViewVariableType;
}

export class ExtendBaseType extends BaseType<ExtendBaseTypeJSON> {
  static kind: string = ExtendASTKind.ExtendBaseType;

  type: ViewVariableType;

  fromJSON(json: ExtendBaseTypeJSON): void {
    if (this.extendType !== json.type) {
      this.type = json.type;
      this.fireChange();
    }
    // do nothing
  }

  toJSON(): ExtendBaseTypeJSON & { kind: string } {
    return {
      kind: ExtendASTKind.ExtendBaseType,
      type: this.type,
    };
  }

  public isTypeEqual(targetTypeJSON: ASTNodeJSON | undefined): boolean {
    const isSuperEqual = super.isTypeEqual(targetTypeJSON);
    return (
      isSuperEqual && this.type === (targetTypeJSON as ExtendBaseTypeJSON)?.type
    );
  }
}

export const createExtendBaseType = (json: ExtendBaseTypeJSON) => ({
  kind: ExtendASTKind.ExtendBaseType,
  ...json,
});
