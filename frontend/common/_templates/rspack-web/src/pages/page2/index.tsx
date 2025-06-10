import React from 'react';

import { Button } from '@douyinfe/semi-ui';

import { usePage2Store } from '@/pages/page2/store';

export function Page2() {
  const { count, updateCount } = usePage2Store();
  return (
    <div className="flex justify-center flex-col items-center">
      <div>page2 with store</div>
      <div>
        <Button onClick={() => updateCount()}>count {count}</Button>
      </div>
    </div>
  );
}
