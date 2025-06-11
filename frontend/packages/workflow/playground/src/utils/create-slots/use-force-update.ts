// Inspired from reach-ui: https://github.com/reach/reach-ui/blob/develop/packages/utils/src/use-force-update.ts
import React from 'react';

export const useForceUpdate = () => {
  const [, rerender] = React.useState({});
  return React.useCallback(() => rerender({}), []);
};
