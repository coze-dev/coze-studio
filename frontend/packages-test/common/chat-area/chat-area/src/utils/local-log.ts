let renderLogCount = 1;
const RENDER_TIP_COUNT = 2000;

export const localLog = (...args: unknown[]) => {
  if (!IS_DEV_MODE) {
    return;
  }
  if (renderLogCount % RENDER_TIP_COUNT === 0) {
    console.log(
      `%c🏆 ChatArea render:\t${renderLogCount}次`,
      'background: #fcfaee; padding: 4px; border-radius: 3px;',
    );
  }
  if (String(args?.[0]).includes('render')) {
    renderLogCount += 1;
  }
  // console.debug(...args);
};
