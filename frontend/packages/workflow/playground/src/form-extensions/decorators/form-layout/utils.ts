export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  return array.reduce((previous, current, index) => {
    if (index % chunkSize === 0) {
      previous.push([current]);
    } else {
      previous[previous.length - 1].push(current);
    }
    return previous;
  }, [] as T[][]);
}
