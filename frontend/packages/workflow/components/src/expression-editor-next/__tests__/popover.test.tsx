import { render } from '@testing-library/react'
import { Popover } from '../popover'

vi.mock('../popover/hooks/use-tree', () => {
  return {
    useTreeRefresh() {},
    useTreeSearch() {},
  }
});

vi.mock('@coze-arch/bot-semi', async () => {
  const { forwardRef } = await vi.importActual('react') as any;
  return {
    Popover({ content }) {
      return <div>{content}</div>
    },
    Tree: forwardRef((_, ref) => {
      return <div ref={ref}></div>
    })
  }
})

vi.mock('@flow-lang-sdk/editor', () => {
  return {
    mixLanguages() {},
    astDecorator: {
      whole: {
        of() {}
      },
      fromCursor: {
        of() {}
      },
    },
  };
});

vi.mock('@flow-lang-sdk/editor/react', () => {
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
                head: 0
              }
            }
          }
        }
      };
    },
  };
});

vi.mock('@flow-lang-sdk/editor/preset-expression', () => {
  return {
    default: []
  };
});

vi.mock('@/expression-editor', () => ({}));

describe('popover', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('Should render props.className correctly', () => {
    const { container } = render(<Popover variableTree={[]} className='foo' />)

    const elements = container.querySelectorAll('.foo')
    expect(elements.length).toBe(1)
  })
})
