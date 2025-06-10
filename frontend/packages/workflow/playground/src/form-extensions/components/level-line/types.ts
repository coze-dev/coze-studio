export interface LineData {
  children?: LineData[];
  helpLineShow?: unknown[];
  isLast?: boolean;
  isFirst?: boolean;
}

export enum LineShowResult {
  HalfTopRoot,
  HalfTopRootWithChildren,
  HalfBottomRoot,
  HalfBottomRootWithChildren,
  FullRoot,
  FullRootWithChildren,
  HalfTopChild,
  HalfTopChildWithChildren,
  FullChild,
  FullChildWithChildren,
  EmptyBlock,
  HelpLineBlock,
  RootWithChildren,
}
