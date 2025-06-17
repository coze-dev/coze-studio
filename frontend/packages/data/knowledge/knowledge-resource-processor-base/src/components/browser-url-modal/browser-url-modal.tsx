import { useEffect, useState } from 'react';

import { nanoid } from 'nanoid';
import { transSliceContentOutput } from '@coze-data/knowledge-modal-base';
import {
  DocumentEditor,
  useInitEditor,
  EditorToolbar,
} from '@coze-data/knowledge-common-components/text-knowledge-editor';
import { I18n } from '@coze-arch/i18n';
import { Form, Input, Modal, Toast } from '@coze-arch/coze-design';
import { MemoryApi, KnowledgeApi } from '@coze-arch/bot-api';

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

const getWebInfo = async (
  webID: string,
  setPageList: React.Dispatch<
    React.SetStateAction<ViewOnlinePageDetailProps[]>
  >,
) => {
  if (!webID) {
    return;
  }
  const { data: responseData } = await KnowledgeApi.GetWebInfo({
    web_ids: [webID],
    include_content: true,
  });
  if (responseData?.[webID]?.web_info) {
    const arr = responseData?.[webID]?.web_info?.subpages?.map(item => ({
      id: item?.id,
      url: item?.url,
      title: item?.title,
      content: item?.content,
    }));
    if (arr) {
      setPageList(
        ([] as ViewOnlinePageDetailProps[])
          .concat({
            id: responseData?.[webID]?.web_info?.id,
            url: responseData?.[webID]?.web_info?.url,
            title: responseData?.[webID]?.web_info?.title,
            content: responseData?.[webID]?.web_info?.content,
          })
          .concat(arr),
      );
    } else {
      setPageList([
        {
          id: responseData?.[webID]?.web_info?.id,
          url: responseData?.[webID]?.web_info?.url,
          title: responseData?.[webID]?.web_info?.title,
          content: responseData?.[webID]?.web_info?.content,
        },
      ]);
    }
  }
};

export const useBrowseUrlModal = ({
  name,
  webID,
  updateInterval,
  onSubmit,
}: {
  name: string;
  webID?: string;
  updateInterval?: number;
  onSubmit: (name: string, content?: string) => void;
}): UseBrowseDetailModalReturnValue => {
  const [docName, setDocName] = useState<string>(name);
  const [visible, setVisible] = useState(false);
  const [pageList, setPageList] = useState<ViewOnlinePageDetailProps[]>([]);

  const { editor } = useInitEditor({
    chunk: {
      text_knowledge_editor_chunk_uuid: nanoid(),
      content: pageList?.[0]?.content || '',
    },
    editorProps: {
      attributes: {
        class: 'h-[360px] overflow-y-auto',
      },
    },
    onChange: v => {
      setPageList(
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
    if (visible && webID) {
      getWebInfo(webID, setPageList);
    }
  }, [visible, webID]);

  return {
    node: (
      <Modal
        title={I18n.t('knowledge_insert_img_001')}
        visible={visible}
        width={792}
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
          setVisible(false);
          Toast.success({
            content: I18n.t('datasets_url_saveSuccess'),
            showClose: false,
          });
          onSubmit?.(docName, content);
        }}
        onCancel={() => setVisible(false)}
      >
        <Form<Record<string, unknown>>
          layout="vertical"
          showValidateIcon={false}
        >
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
    ),
    open: () => setVisible(true),
  };
};
