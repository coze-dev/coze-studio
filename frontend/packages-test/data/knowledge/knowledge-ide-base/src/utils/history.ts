const MAX_HISTORY_COUNT = 2;
export const hasHistory = (): boolean =>
  Boolean(
    window.history.length > MAX_HISTORY_COUNT && window.document?.referrer,
  );
