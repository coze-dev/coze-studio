/* eslint-disable @typescript-eslint/naming-convention */
import React, { useState } from 'react';

import { expect, describe, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { DataErrorBoundary } from '../src/components/error-boundary/error-boundary';
import { DataNamespace } from '../src';

class MyErrorBoundary extends React.Component<
  {
    children: React.ReactElement;
    FallbackComponent: () => React.ReactElement;
    onError: (...args: any[]) => void;
  },
  { hasError: boolean }
> {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(_error) {
    // Update state so next render shows fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to an error reporting service
    this.props.onError(error, errorInfo);
  }

  render() {
    const { children, FallbackComponent } = this.props;
    if (this.state.hasError) {
      return <FallbackComponent />;
    }
    return children;
  }
}

export function ErrorButton() {
  const [clicked, setClicked] = useState(false);
  if (clicked) {
    throw new Error('test');
  }
  return <button onClick={() => setClicked(true)}>test</button>;
}

const globalFlag = vi.hoisted(() => ({
  persistError: vi.fn(),
}));

vi.mock('@coze-arch/logger', () => ({
  ErrorBoundary: props => <MyErrorBoundary {...props} />,
  logger: {
    persist: {
      error: globalFlag.persistError,
    },
  },
}));

vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: vi.fn().mockImplementation((title: string) => title),
  },
}));

describe('test DataErrorBoundary', () => {
  test('render children', async () => {
    await render(
      <DataErrorBoundary namespace={DataNamespace.KNOWLEDGE}>
        <button>test</button>
      </DataErrorBoundary>,
    );
    const testButton = await screen.queryByText('test');
    expect(testButton).not.toBeNull();
  });

  test('on error callback', async () => {
    await render(
      <DataErrorBoundary namespace={DataNamespace.KNOWLEDGE}>
        <ErrorButton />
      </DataErrorBoundary>,
    );
    const testButton = await screen.queryByText('test');
    expect(testButton).not.toBeNull();
    await fireEvent.click(testButton);
    expect(globalFlag.persistError).toBeCalled();
  });

  test('fallback render', async () => {
    await render(
      <DataErrorBoundary namespace={DataNamespace.KNOWLEDGE}>
        <ErrorButton />
      </DataErrorBoundary>,
    );
    const testButton = await screen.queryByText('test');
    expect(testButton).not.toBeNull();
    await fireEvent.click(testButton);
    const fallbackComp = await screen.queryByText('data_error_title');
    expect(fallbackComp).not.toBeNull();
  });
});
