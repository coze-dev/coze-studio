export type Extension =
  | {
      extension: Extension;
    }
  | readonly Extension[];

export interface SelectionInfo {
  from: number;
  to: number;
  anchor: number;
  head: number;
}
