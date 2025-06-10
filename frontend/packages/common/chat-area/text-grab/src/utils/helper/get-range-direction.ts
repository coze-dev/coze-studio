export const getRangeDirection = (range: Range) => {
  const position = range.compareBoundaryPoints(Range.START_TO_END, range);

  if (position === 0) {
    return 'none'; // 选区起点和终点相同，即没有选择文本
  }

  return position === -1 ? 'backward' : 'forward';
};
