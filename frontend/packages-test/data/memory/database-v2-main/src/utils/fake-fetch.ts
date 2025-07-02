// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const simulateFetch = (v: any) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(v);
    }, 2000);
  });
