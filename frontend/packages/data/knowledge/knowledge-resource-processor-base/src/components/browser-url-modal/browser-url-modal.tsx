import { useEffect, useState, useRef } from 'react';

import {
  SegmentationMode,
  transSliceContentOutput,
} from '@coze-data/knowledge-modal-base';
import {
  SegmentEditor,
  type SegmentEditorMethods,
} from '@coze-data/knowledge-modal-base';
import { I18n } from '@coze-arch/i18n';
import { MemoryApi, KnowledgeApi } from '@coze-arch/bot-api';
import { Form, Input, Modal, Toast } from '@coze/coze-design';

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
  editorRef: React.RefObject<SegmentEditorMethods>,
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
    if (editorRef.current) {
      editorRef.current?.updateContent(
        responseData?.[webID]?.web_info?.content as string,
      );
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
  const editorRef = useRef<SegmentEditorMethods>(null);
  const [uploading, setUploading] = useState(false);
  const [docName, setDocName] = useState<string>(name);
  const [visible, setVisible] = useState(false);
  const [pageList, setPageList] = useState<ViewOnlinePageDetailProps[]>([]);

  useEffect(() => {
    setDocName(name);
  }, [name]);

  useEffect(() => {
    if (visible && webID) {
      getWebInfo(webID, editorRef, setPageList);
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
        okButtonProps={{
          disabled: uploading,
        }}
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
            <SegmentEditor
              ref={editorRef}
              value={pageList?.[0]?.content || ''}
              mode={SegmentationMode.Inline}
              onChange={function (content: string): void | Promise<void> {
                setPageList(
                  ([] as ViewOnlinePageDetailProps[]).concat({
                    ...pageList?.[0],
                    content,
                  }),
                );
              }}
              setUploading={setUploading}
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
