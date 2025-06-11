import { type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';

import { initEditorByPrologue } from '@/component/onboarding-message/onboarding-editor/method/init-editor';
import { useInitEditor } from '@/component/onboarding-message/onboarding-editor/hooks/use-init-editor';
import type { OnboardingEditorContext } from '@/component/onboarding-message/onboarding-editor';

vi.mock(
  '@/component/onboarding-message/onboarding-editor/method/init-editor',
  () => ({
    initEditorByPrologue: vi.fn().mockResolvedValue(undefined),
  }),
);

describe('useInitEditor', () => {
  let props;
  let editorRef;

  beforeEach(() => {
    props = {
      initValues: {
        prologue: 'prologue',
      },
    };
    editorRef = {
      current: {
        scrollModule: {
          scrollTo: vi.fn(),
        },
      },
    };
    (initEditorByPrologue as Mock).mockClear();
  });

  it('calls initEditorByPrologue when prologue and editorRef.current are defined', () => {
    renderHook(() => useInitEditor({ api: undefined, props, editorRef }));

    expect(initEditorByPrologue).toHaveBeenCalledWith({
      prologue: props.initValues.prologue,
      editorRef,
    });
  });

  it('does not call initEditorByPrologue when prologue is not defined', () => {
    props.initValues.prologue = undefined;
    const { result } = renderHook(() =>
      useInitEditor({ api: undefined, props, editorRef }),
    );

    act(() => {
      result.current;
    });

    expect(initEditorByPrologue).not.toHaveBeenCalled();
  });

  it('does not call initEditorByPrologue when editorRef.current is not defined', () => {
    editorRef.current = undefined;
    const { result } = renderHook(() =>
      useInitEditor({ api: undefined, props, editorRef }),
    );

    act(() => {
      result.current;
    });

    expect(initEditorByPrologue).not.toHaveBeenCalled();
  });

  it('should not call initEditorByPrologue when it has been initialized', () => {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    const { rerender } = renderHook<OnboardingEditorContext, void>(hookProps =>
      useInitEditor({
        api: hookProps.api ?? undefined,
        props: hookProps.props ?? props,
        editorRef,
      }),
    );
    rerender({
      api: undefined,
      props: {
        initValues: {
          prologue: 'iwdfasdfa',
        },
      },
      editorRef,
    });
    rerender({
      api: undefined,
      props: {
        initValues: {
          prologue: 'acbcfaa',
        },
      },
      editorRef,
    });

    expect(initEditorByPrologue).toHaveBeenCalledTimes(1);
  });
  it('should not call initEditorByPrologue when initValues is not defined', () => {
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    const { rerender } = renderHook<OnboardingEditorContext, void>(hookProps =>
      useInitEditor({
        api: hookProps.api ?? undefined,
        props: hookProps.props ?? props,
        editorRef,
      }),
    );
    rerender({
      api: undefined,
      props: {},
      editorRef,
    });

    expect(initEditorByPrologue).not.toHaveBeenCalled();
  });
});
