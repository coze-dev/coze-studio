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
