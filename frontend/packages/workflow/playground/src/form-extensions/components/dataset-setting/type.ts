export enum Strategy {
  Semantic = 0,
  Hybird = 1,
  FullText = 20,
}

export interface DataSetInfo {
  top_k: number;
  min_score?: number;
  strategy?: Strategy;
  use_nl2sql?: boolean;
  use_rerank?: boolean;
  use_rewrite?: boolean;
  is_personal_only?: boolean;
}
