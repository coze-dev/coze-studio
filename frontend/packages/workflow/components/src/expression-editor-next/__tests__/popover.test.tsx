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

import { render } from '@testing-library/react';
import { Popover } from '../popover';

vi.mock('../popover/hooks/use-tree', () => {
  return {
    useTreeRefresh() {},
    useTreeSearch() {},
  };
});

vi.mock('@coze-arch/bot-semi', async () => {
  const { forwardRef } = (await vi.importActual('react')) as any;
  return {
    Popover({ content }) {
      return <div>{content}</div>;
    },
    Tree: forwardRef((_, ref) => {
      return <div ref={ref}></div>;
    }),
  };
});

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
    Renderer() {},
    CursorMirror() {
      return null;
    },
    SelectionSide: {
      Head: 'head',
      Anchor: 'anchor',
    },
    useEditor() {
      return {
        disableKeybindings() {},
        $on() {},
        $off() {},
        replaceTextByRange() {},
        $view: {
          state: {
            selection: {
              main: {
                from: 0,
                to: 0,
                anchor: 0,
                head: 0,
              },
            },
          },
        },
      };
    },
  };
});

vi.mock('@coze-editor/editor/preset-expression', () => {
  return {
    default: [],
  };
});

vi.mock('@/expression-editor', () => ({}));

describe('popover', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('Should render props.className correctly', () => {
    const { container } = render(<Popover variableTree={[]} className="foo" />);

    const elements = container.querySelectorAll('.foo');
    expect(elements.length).toBe(1);
  });
});
