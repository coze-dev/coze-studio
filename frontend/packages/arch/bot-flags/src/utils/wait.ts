export const ONE_SEC = 1000;

export const wait = (ms: number) =>
  new Promise(r => {
    setTimeout(r, ms);
  });

export const nextTick = () => new Promise(r => requestAnimationFrame(r));
