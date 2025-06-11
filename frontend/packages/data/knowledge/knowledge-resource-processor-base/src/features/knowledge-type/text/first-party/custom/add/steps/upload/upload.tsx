import { useContext, useMemo } from 'react';

import { CozeInputWithCountField } from '@coze-data/utils';
import { KnowledgeParamsStoreContext } from '@coze-data/knowledge-stores';
import {
  type ContentProps,
  FooterBtnStatus,
} from '@coze-data/knowledge-resource-processor-core';
import {
  SegmentEditor,
  SegmentationMode,
} from '@coze-data/knowledge-modal-base';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { Form } from '@coze-arch/bot-semi';

import type { UploadTextCustomAddUpdateStore } from '../../store';
import { TextCustomAddUpdateStep } from '../../constants';

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
          <SegmentEditor
            enableImg={!isDouyin}
            onChange={setDocContent}
            mode={SegmentationMode.Inline}
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
