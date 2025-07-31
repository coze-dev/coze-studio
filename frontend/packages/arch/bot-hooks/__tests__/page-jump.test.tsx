/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { type PropsWithChildren, useState } from 'react';

import { renderHook } from '@testing-library/react-hooks';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { PageType, SceneType } from '../src/page-jump/config';
import { usePageJumpResponse, usePageJumpService } from '../src/page-jump';

describe('page jump', () => {
  const botID = '123';
  const spaceID = '234';
  const workflowID = '345';

  // eslint-disable-next-line @typescript-eslint/naming-convention -- this is the component
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
