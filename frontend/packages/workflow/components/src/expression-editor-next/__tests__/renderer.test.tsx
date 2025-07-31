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

import { useEffect } from 'react';
import { render } from '@testing-library/react';
import { Renderer } from '../renderer';

const { SDKRenderer } = vi.hoisted(() => ({ SDKRenderer: vi.fn() }));

vi.mock('@coze-editor/editor', () => {
  return {
    mixLanguages() {},
    astDecorator: {
      whole: {
        of() {},
      },
      fromCursor: {
        of() {},
      },
    },
  };
});

vi.mock('@coze-editor/editor/react', () => {
  return {
    Renderer: SDKRenderer,
  };
});

vi.mock('@coze-editor/editor/preset-expression', () => {
  return {
    default: [],
  };
});

vi.mock('@/expression-editor', () => ({}));

describe('renderer', () => {
  beforeEach(() => {
    SDKRenderer.mockImplementation(({ defaultValue, didMount }) => {
      useEffect(() => {
        didMount({
          getValue() {},
          setValue() {},
          updateWholeDecorations() {},
        });
      }, []);

      return null;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('Should props.className work correctly', () => {
    render(<Renderer variableTree={[]} className="foo" />);

    // @ts-expect-error -- mock
    expect(SDKRenderer.mock.lastCall[0]).toMatchObject({
      options: {
        contentAttributes: {
          class: 'foo flow-canvas-not-draggable',
        },
      },
    });
  });

  it('Should props.dataTestID work correctly', () => {
    render(<Renderer variableTree={[]} dataTestID="foo" />);

    // @ts-expect-error -- mock
    expect(SDKRenderer.mock.lastCall[0]).toMatchObject({
      options: {
        contentAttributes: {
          'data-testid': 'foo',
        },
      },
    });
  });

  it('Should props.placeholder work correctly', () => {
    render(<Renderer variableTree={[]} placeholder="foo" />);

    // @ts-expect-error -- mock
    expect(SDKRenderer.mock.lastCall[0]).toMatchObject({
      options: {
        placeholder: 'foo',
      },
    });
  });

  it('Should props.value work correctly', () => {
    let value = '';
    const getValue = () => value;
    const setValue = vi.fn();

    SDKRenderer.mockImplementation(({ defaultValue, didMount }) => {
      useEffect(() => {
        value = defaultValue;
        didMount({
          getValue,
          setValue,
          updateWholeDecorations() {},
        });
      }, []);

      return null;
    });

    const { rerender } = render(<Renderer variableTree={[]} value="value" />);

    // @ts-expect-error -- mock
    expect(SDKRenderer.mock.lastCall[0]).toMatchObject({
      defaultValue: 'value',
    });

    rerender(<Renderer variableTree={[]} value="value2" />);

    expect(setValue).toHaveBeenCalledTimes(1);
    expect(setValue).toHaveBeenLastCalledWith('value2');
  });

  it('Should props.onChange work correctly', () => {
    let change: ((e: { value: string }) => void) | null = null;
    SDKRenderer.mockImplementation(({ onChange, didMount }) => {
      change = onChange;
      useEffect(() => {
        didMount({
          getValue() {},
          setValue() {},
          updateWholeDecorations() {},
        });
      }, []);
    });
    const onChange = vi.fn();
    render(<Renderer variableTree={[]} onChange={onChange} />);

    change!({
      value: 'foo',
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith('foo');

    change!({
      value: 'bar',
    });

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith('bar');
  });

  it('Should props.readonly work correctly', () => {
    const { rerender } = render(<Renderer variableTree={[]} readonly={true} />);

    expect(SDKRenderer).toHaveBeenCalledTimes(1);
    // @ts-expect-error -- mock
    expect(SDKRenderer.mock.lastCall[0]).toMatchObject({
      options: {
        readOnly: true,
      },
    });

    rerender(<Renderer variableTree={[]} readonly={false} />);

    expect(SDKRenderer).toHaveBeenCalledTimes(2);
    // @ts-expect-error -- mock
    expect(SDKRenderer.mock.lastCall[0]).toMatchObject({
      options: {
        readOnly: false,
      },
    });
  });
});
