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

import { useContext, useMemo } from 'react';

import { nanoid } from 'nanoid';
import { CozeInputWithCountField } from '@coze-data/utils';
import { KnowledgeParamsStoreContext } from '@coze-data/knowledge-stores';
import {
  type ContentProps,
  FooterBtnStatus,
} from '@coze-data/knowledge-resource-processor-core';
import {
  DocumentEditor,
  useInitEditor,
  EditorToolbar,
  type Chunk,
} from '@coze-data/knowledge-common-components/text-knowledge-editor';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { Form } from '@coze-arch/bot-semi';

import type { UploadTextCustomAddUpdateStore } from '../../store';
import { TextCustomAddUpdateStep } from '../../constants';
import { editorToolbarActionRegistry } from './editor-toolbar-actions-contributes';
import { editorContextActionRegistry } from './editor-context-actions-contributes';

import styles from './index.module.less';

const MAX_DOC_NAME_LEN = 100;

export const TextUpload = <T extends UploadTextCustomAddUpdateStore>(
  props: ContentProps<T>,
) => {
  const { useStore, footer } = props;
  /** common store */
  const docName = useStore(state => state.docName);
  const docContent = useStore(state => state.docContent);
  const isDouyin = useContext(KnowledgeParamsStoreContext)?.paramsStore?.(
    s => s.params?.isDouyinBot,
  );
  /** common action */
  const setDocName = useStore(state => state.setDocName);
  const setDocContent = useStore(state => state.setDocContent);
  const setCurrentStep = useStore(state => state.setCurrentStep);

  const buttonStatus = useMemo(() => {
    if (!docName || !docContent) {
      return FooterBtnStatus.DISABLE;
    }
    return FooterBtnStatus.ENABLE;
  }, [docName, docContent]);

  const handleClickNext = () => {
    setCurrentStep(TextCustomAddUpdateStep.SEGMENT_CLEANER);
  };

  const initChunk = useMemo<Chunk>(
    () => ({
      text_knowledge_editor_chunk_uuid: nanoid(),
      content: '',
    }),
    [],
  );

  const { editor } = useInitEditor({
    chunk: initChunk,
    editorProps: {
      attributes: {
        class: 'h-[360px] overflow-y-auto',
      },
    },
    onChange: v => {
      setDocContent(v.content ?? '');
    },
  });

  return (
    <>
      <Form<Record<string, unknown>>
        layout="vertical"
        showValidateIcon={false}
        className={styles['custom-text-form']}
      >
        <CozeInputWithCountField
          data-testid={KnowledgeE2e.CustomUploadNameInput}
          className={styles['doc-name-input']}
          field="docName"
          autoFocus
          trigger="blur"
          onChange={(v: string) => setDocName(v)}
          maxLength={MAX_DOC_NAME_LEN}
          placeholder={I18n.t('knowledge_upload_text_custom_doc_name_tips')}
          label={I18n.t('knowledge_upload_text_custom_doc_name')}
          rules={[
            {
              required: true,
              message: I18n.t('knowledge_upload_text_custom_doc_name_tips'),
            },
          ]}
        />
        <Form.Slot
          className={styles['form-segment-content']}
          label={{ text: I18n.t('knowledge_upload_text_custom_doc_content') }}
          // error={I18n.t('knowledge_upload_text_custom_doc_content_tips')}
        >
          <DocumentEditor
            editor={editor}
            placeholder={I18n.t(
              'knowledge_upload_text_custom_doc_content_tips',
            )}
            editorContextMenuItemsRegistry={
              !isDouyin ? editorContextActionRegistry : undefined
            }
            editorBottomSlot={
              !isDouyin ? (
                <EditorToolbar
                  editor={editor}
                  actionRegistry={editorToolbarActionRegistry}
                />
              ) : null
            }
          />
        </Form.Slot>
      </Form>

      {footer?.([
        {
          e2e: KnowledgeE2e.UploadUnitNextBtn,
          type: 'hgltplus',
          theme: 'solid',
          text: I18n.t('datasets_createFileModel_NextBtn'),
          status: buttonStatus,
          onClick: handleClickNext,
        },
      ])}
    </>
  );
};
