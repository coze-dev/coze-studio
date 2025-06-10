import { type PropsWithChildren, useState } from 'react';

import { renderHook } from '@testing-library/react-hooks';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { PageType, SceneType } from '../src/page-jump/config';
import { usePageJumpResponse, usePageJumpService } from '../src/page-jump';

describe('page jump', () => {
  const botID = '123';
  const spaceID = '234';
  const workflowID = '345';

  // eslint-disable-next-line @typescript-eslint/naming-convention -- 这是组件
  const MockWorkflowPage = () => {
    const jumpResponse = usePageJumpResponse(PageType.WORKFLOW);
    const [cleared, setCleared] = useState(false);
    if (cleared) {
      expect(jumpResponse).toBeNull();
    } else {
      expect(jumpResponse).toMatchObject({
        scene: SceneType.BOT__VIEW__WORKFLOW,
        botID,
        spaceID,
        workflowID,
      });
      expect(jumpResponse?.clearScene).toBeTypeOf('function');
      setCleared(true);
      jumpResponse?.clearScene(true);
    }
    return null;
  };

  const wrapper: React.FC<PropsWithChildren> = ({ children }) => (
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<>{children}</>} />
        <Route path="/work_flow" element={<MockWorkflowPage />} />
      </Routes>
    </MemoryRouter>
  );

  it('can jump to workflow and get response and clear', () => {
    const {
      result: {
        current: { jump },
      },
      rerender,
    } = renderHook(() => usePageJumpService(), { wrapper });

    expect(jump).toBeTypeOf('function');

    jump(SceneType.BOT__VIEW__WORKFLOW, {
      botID,
      spaceID,
      workflowID,
    });

    Promise.resolve().then(() => {
      rerender();
    });
  });

  it('get no response if no scene provided', () => {
    const {
      result: { current: response },
    } = renderHook(() => usePageJumpResponse(PageType.BOT), { wrapper });
    expect(response).toBeNull();
  });
});
