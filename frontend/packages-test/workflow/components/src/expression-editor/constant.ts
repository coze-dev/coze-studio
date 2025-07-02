export enum ExpressionEditorEvent {
  Change = 'change',
  Select = 'select',
  Dispose = 'dispose',
  CompositionStart = 'compositionStart',
}

export enum ExpressionEditorToken {
  Start = '{',
  End = '}',
  FullStart = '{{',
  FullEnd = '}}',
  Separator = '.',
  ArrayStart = '[',
  ArrayEnd = ']',
}

export enum ExpressionEditorSegmentType {
  ObjectKey = 'object_key',
  ArrayIndex = 'array_index',
  EndEmpty = 'end_empty',
}

export enum ExpressionEditorSignal {
  Line = 'paragraph',
  Valid = 'valid',
  Invalid = 'invalid',
  SelectedValid = 'selectedValid',
  SelectedInvalid = 'selectedInvalid',
}
