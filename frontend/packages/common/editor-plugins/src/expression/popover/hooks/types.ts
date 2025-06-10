interface CompletionContext {
  from: number;
  to: number;
  text: string;
  offset: number;
  textBefore: string;
}

export type { CompletionContext };
