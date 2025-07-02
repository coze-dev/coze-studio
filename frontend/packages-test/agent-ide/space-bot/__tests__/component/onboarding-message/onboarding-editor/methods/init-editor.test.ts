import { md2html } from '@coze-common/md-editor-adapter';
import { type Editor } from '@coze-common/md-editor-adapter';

import {
  initEditorByPrologue,
  type InitEditorByPrologueProps,
} from '@/component/onboarding-message/onboarding-editor/method/init-editor';

vi.mock('@coze-common/md-editor-adapter', () => ({
  md2html: vi.fn(),
}));

describe('initEditorByPrologue', () => {
  let editorRef: React.RefObject<Editor>;

  beforeEach(() => {
    editorRef = { current: { setHTML: vi.fn() } } as any;
  });

  it('should convert markdown to html and set to editor', () => {
    const prologue = '**Hello**';
    const htmlContent = '<strong>Hello</strong>';
    vi.mocked(md2html).mockReturnValue(htmlContent);

    const props: InitEditorByPrologueProps = { prologue, editorRef };
    initEditorByPrologue(props);

    expect(md2html).toHaveBeenCalledWith(prologue);
    expect(editorRef.current?.setHTML).toHaveBeenCalledWith(htmlContent);
  });

  it('should not set html to editor if editorRef is not defined', () => {
    const prologue = '**Hello**';
    const htmlContent = '<strong>Hello</strong>';
    vi.mocked(md2html).mockReturnValue(htmlContent);

    const props: InitEditorByPrologueProps = { prologue, editorRef: {} as any };
    initEditorByPrologue(props);

    expect(md2html).toHaveBeenCalledWith(prologue);
    expect(editorRef.current?.setHTML).not.toHaveBeenCalled();
  });
});
