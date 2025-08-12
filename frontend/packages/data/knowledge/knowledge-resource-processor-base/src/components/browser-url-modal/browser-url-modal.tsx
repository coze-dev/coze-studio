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

import { useEffect, useState } from 'react';

import { nanoid } from 'nanoid';
import { transSliceContentOutput } from '@coze-data/knowledge-modal-base';
import {
  DocumentEditor,
  useInitEditor,
  EditorToolbar,
  type Chunk,
} from '@coze-data/knowledge-common-components/text-knowledge-editor';
import { I18n } from '@coze-arch/i18n';
import { Form, Input, Modal, Toast } from '@coze-arch/coze-design';
import { MemoryApi } from '@coze-arch/bot-api';

import { useGetWebInfo } from './hooks/get-web-info';
import { editorToolbarActionRegistry } from './editor-toolbar-actions-contributes';
import { editorContextActionRegistry } from './editor-context-actions-contributes';

import styles from './index.module.less';

const MAX_DOC_NAME_LEN = 100;
export interface UseBrowseDetailModalReturnValue {
  open: () => void;
  node: JSX.Element;
}

export interface ViewOnlinePageDetailProps {
  id?: string;
  url?: string;
  content?: string;
  title?: string;
}

export interface BrowseUrlModalProps {
  name: string;
  webID?: string;
  onSubmit: (name: string, content?: string) => void;
  onCancel?: () => void;
}

export const BrowseUrlModal = ({
  name,
  webID,
  onSubmit,
  onCancel,
}: BrowseUrlModalProps) => {
  const [docName, setDocName] = useState<string>(name);
  const { data: pageList, runAsync, mutate } = useGetWebInfo();

  const [initChunk, setInitChunk] = useState<Chunk>({
    text_knowledge_editor_chunk_uuid: nanoid(),
    content: '',
  });

  const { editor } = useInitEditor({
    chunk: initChunk,
    editorProps: {
      attributes: {
        class: 'h-[360px] overflow-y-auto',
      },
    },
    onChange: v => {
      mutate(
        ([] as ViewOnlinePageDetailProps[]).concat({
          ...pageList?.[0],
          content: v.content ?? '',
        }),
      );
    },
  });

  useEffect(() => {
    setDocName(name);
  }, [name]);

  useEffect(() => {
    if (webID) {
      runAsync(webID).then(data => {
        setInitChunk({
          text_knowledge_editor_chunk_uuid: nanoid(),
          content: data[0].content ?? '',
        });
      });
    }
  }, [webID, runAsync, editor]);

  return (
    <Modal
      title={I18n.t('knowledge_insert_img_001')}
      width={792}
      visible
      cancelText={I18n.t('Cancel')}
      okText={I18n.t('datasets_segment_detailModel_save')}
      maskClosable={false}
      onOk={async () => {
        const pageInfo = pageList?.[0];
        const content = transSliceContentOutput(pageInfo.content as string);
        await MemoryApi.SubmitWebContentV2({
          web_id: pageInfo.id,
          content,
        });
        Toast.success({
          content: I18n.t('datasets_url_saveSuccess'),
          showClose: false,
        });
        onSubmit?.(docName, content);
        onCancel?.();
      }}
      onCancel={() => {
        onCancel?.();
      }}
    >
      <Form<Record<string, unknown>> layout="vertical" showValidateIcon={false}>
        <Form.Slot
          label={{ text: I18n.t('knowledge_upload_text_custom_doc_name') }}
        >
          <Input
            className={styles['doc-name-input']}
            value={docName}
            onChange={(v: string) => setDocName(v)}
            maxLength={MAX_DOC_NAME_LEN}
            placeholder={I18n.t('knowledge_upload_text_custom_doc_name_tips')}
          />
        </Form.Slot>
        <Form.Slot
          className={styles['form-segment-content']}
          label={{ text: I18n.t('knowledge_upload_text_custom_doc_content') }}
        >
          <DocumentEditor
            editor={editor}
            placeholder={I18n.t(
              'knowledge_upload_text_custom_doc_content_tips',
            )}
            editorContextMenuItemsRegistry={editorContextActionRegistry}
            editorBottomSlot={
              <EditorToolbar
                editor={editor}
                actionRegistry={editorToolbarActionRegistry}
              />
            }
          />
          {pageList?.[0]?.url ? (
            <div className={styles['browse-source-url']}>
              {I18n.t('knowledge_insert_img_003', {
                url: pageList[0]?.url,
              })}
            </div>
          ) : null}
        </Form.Slot>
      </Form>
    </Modal>
  );
};

export const useBrowseUrlModal = (props: BrowseUrlModalProps) => {
  const [visible, setVisible] = useState(false);

  return {
    open: () => setVisible(true),
    close: () => setVisible(false),
    node: visible ? (
      <BrowseUrlModal {...props} onCancel={() => setVisible(false)} />
    ) : null,
  };
};
