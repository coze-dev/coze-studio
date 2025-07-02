import { LineShowResult, type LineData } from './types';

// eslint-disable-next-line complexity
export function getLineShowResult<Data extends LineData>({
  level,
  data,
}: {
  level: number;
  data: Data;
}): Array<LineShowResult> {
  const isRootWithChildren = level === 0 && (data.children || []).length > 0;
  const isRootWithoutChildren =
    level === 0 && (data.children || []).length === 0;
  const isChildWithChildren = level > 0 && (data.children || []).length > 0;
  const isChildWithoutChildren =
    level > 0 && (data.children || []).length === 0;
  const res: Array<LineShowResult> = (data.helpLineShow || []).map(item =>
    item ? LineShowResult.HelpLineBlock : LineShowResult.EmptyBlock,
  );

  if (isRootWithChildren) {
    res.push(LineShowResult.RootWithChildren);
  } else if (!isRootWithoutChildren) {
    // 根节点不需要展示线，只有非根节点才需要辅助线
    if (isChildWithChildren) {
      if (data.isLast) {
        res.push(LineShowResult.HalfTopChildWithChildren);
      } else if (data.isFirst) {
        res.push(LineShowResult.FullChildWithChildren);
      } else {
        res.push(LineShowResult.FullChildWithChildren);
      }
    } else if (isChildWithoutChildren) {
      if (data.isLast) {
        res.push(LineShowResult.HalfTopChild);
      } else if (data.isFirst) {
        res.push(LineShowResult.FullChild);
      } else {
        res.push(LineShowResult.FullChild);
      }
    }
  }
  return res;
}
