import {
  exhaustiveCheckSimple,
  exhaustiveCheckForRecord,
} from '../src/exhaustive-check';

it('works', () => {
  const obj = { a: 1 };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars -- .
  const { a, ...rest } = obj;
  exhaustiveCheckForRecord(rest);
  type N = 1;
  const n: N = 1;
  switch (n) {
    case 1:
      break;
    default:
      exhaustiveCheckSimple(n);
  }
});
