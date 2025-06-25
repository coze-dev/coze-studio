interface SpanTypeConfig {
  label?: string;
}

/** key: SpanType */
export type SpanTypeConfigMap = Record<number, SpanTypeConfig | undefined>;

interface SpanCategoryConfig {
  label: string;
}

/** key: SpanCategory */
export type SpanCategoryConfigMap = Record<
  number,
  SpanCategoryConfig | undefined
>;

interface SpanStatusConfig {
  label: string;
}

export interface SpanStatusConfigMap {
  [x: number]: SpanStatusConfig | undefined;
}
