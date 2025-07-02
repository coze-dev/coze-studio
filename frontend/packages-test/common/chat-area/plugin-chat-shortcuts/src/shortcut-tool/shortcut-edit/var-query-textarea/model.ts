import { ExpressionEditorModel } from '@coze-workflow/sdk';

export class VarExpressionEditorModel extends ExpressionEditorModel {
  public insertText = (text: string) => {
    this.editor.insertText(text);
    this.setValue(text);
  };
}
