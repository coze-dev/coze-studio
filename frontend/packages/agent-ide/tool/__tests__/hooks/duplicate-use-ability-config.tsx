import React, { type FC } from 'react';

import {
  renderHook,
  type WrapperComponent,
} from '@testing-library/react-hooks';
import { ToolGroupKey } from '@coze-agent-ide/tool-config';

import { useAbilityConfig } from '../../src/hooks/builtin/use-ability-config';
import {
  AbilityAreaContextProvider,
  type ToolEntryCommonProps,
  ToolView,
  ToolKey,
  AbilityScope,
  GroupingContainer,
} from '../../src';

vi.stubGlobal('IS_DEV_MODE', false);

type ITestComponentProps = ToolEntryCommonProps;

const TestComponent: FC<ITestComponentProps> = ({ title, toolKey }) => (
  <div>
    test{title} {toolKey}
  </div>
);

describe('useAbilityConfig', () => {
  test('useAbilityConfig', () => {
    const wrapper: WrapperComponent<{ children }> = ({ children }) => (
      <AbilityAreaContextProvider mode={0}>
        {children}
        <ToolView>
          <GroupingContainer
            toolGroupKey={ToolGroupKey.CHARACTER}
            title="testGroup"
          >
            <TestComponent toolKey={ToolKey.ONBOARDING} title="demo" />
          </GroupingContainer>
        </ToolView>
      </AbilityAreaContextProvider>
    );

    const { result } = renderHook(() => useAbilityConfig(), { wrapper });

    expect(result.current).toEqual({
      abilityKey: ToolKey.ONBOARDING,
      scope: AbilityScope.TOOL,
    });
  });
});
