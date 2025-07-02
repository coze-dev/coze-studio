import { Suspense, lazy } from 'react';

import { useInputVariables } from '@/hooks';
import { withField } from '@/form';

const CanvasLazy = lazy(async () => {
  const { Canvas: CanvasNode } = await import('./canvas/components/canvas');
  return {
    default: CanvasNode,
  };
});

export const Canvas = withField(props => {
  /**
   * useInputVariables 内部使用了 useContext
   * lazyLoad 会导致 监听不到 context 的变化
   * 所以提前获取 variables
   */
  const variables = useInputVariables({
    needNullType: true,
    needNullName: true,
  });

  return (
    <Suspense fallback={<div>canvas loading...</div>}>
      <CanvasLazy {...props} variables={variables} />
    </Suspense>
  );
});
