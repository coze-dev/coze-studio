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
